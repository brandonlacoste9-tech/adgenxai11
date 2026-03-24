import type { ChatMessage } from "../../shared/chat-api.ts";
import type { CreateTaskBody, TaskJobDto, TaskStepDto, TaskJobSummaryDto } from "../../shared/studio-api.ts";
import { nanoid } from "nanoid";
import { runChat } from "./chat-proxy.ts";
import { searchKnowledgeForAgent } from "./knowledge-service.ts";
import { hydrateJobs, listRecentJobs, saveJobs } from "./task-store.ts";

const jobs = new Map<string, TaskJobDto>();
hydrateJobs(jobs);

function persist(): void {
  saveJobs(jobs);
}

const AGENT_SYSTEM = `You are a task-solving agent with tools.

Available tools (pick exactly one per turn via JSON):
- search_knowledge — use when you need facts from the user's uploaded documents. tool_input is a short search query.
- finish — when you have enough to answer. tool_input is the full final answer for the user (markdown ok).

Rules:
- Output a single JSON object only, no markdown fences. Shape:
  {"thought":"why you're choosing this step","tool":"search_knowledge"|"finish","tool_input":"string"}
- If you do not have a knowledge base or search returns nothing, still reason and finish with the best answer you can.
- Be concise in thoughts; make tool_input useful.`;

function nowIso(): string {
  return new Date().toISOString();
}

function parseAgentJson(text: string): { thought?: string; tool?: string; tool_input?: string } {
  const t = text.trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};
  try {
    return JSON.parse(t.slice(start, end + 1)) as { thought?: string; tool?: string; tool_input?: string };
  } catch {
    return {};
  }
}

function pushTrace(job: TaskJobDto, step: TaskStepDto): void {
  job.trace.push(step);
}

async function runAgent(jobId: string, body: CreateTaskBody): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = "running";
  persist();

  const maxSteps = 12;
  const messages: ChatMessage[] = [
    { role: "system", content: AGENT_SYSTEM },
    {
      role: "user",
      content: [
        `Task: ${body.task.trim()}`,
        body.knowledgeCollectionId
          ? `A knowledge base is available (collection id ${body.knowledgeCollectionId}). Use search_knowledge when you need grounded facts from those documents.`
          : "No knowledge base is attached; answer from general reasoning only.",
      ].join("\n\n"),
    },
  ];

  for (let step = 0; step < maxSteps; step++) {
    const result = await runChat({
      model: body.model,
      messages,
      apiKeys: body.apiKeys,
    });

    if ("error" in result) {
      pushTrace(job, { type: "error", content: result.error, at: nowIso() });
      job.status = "error";
      job.error = result.error;
      persist();
      return;
    }

    const raw = result.content;
    pushTrace(job, { type: "model", content: raw.slice(0, 8000), at: nowIso() });
    persist();

    const parsed = parseAgentJson(raw);
    const tool = parsed.tool?.toLowerCase();
    const toolInput = parsed.tool_input?.trim() || "";

    if (tool === "finish" || (!tool && toolInput)) {
      const answer = tool === "finish" ? toolInput : raw;
      pushTrace(job, { type: "tool", content: `finish: ${answer.slice(0, 2000)}`, at: nowIso() });
      job.status = "done";
      job.result = answer || raw;
      persist();
      return;
    }

    if (tool === "search_knowledge") {
      if (!body.knowledgeCollectionId) {
        const obs = "No knowledge base attached; skipped search.";
        pushTrace(job, { type: "observation", content: obs, at: nowIso() });
        messages.push({ role: "assistant", content: raw });
        messages.push({ role: "user", content: `Observation: ${obs}` });
        continue;
      }
      const obs = await searchKnowledgeForAgent(body.knowledgeCollectionId, toolInput || body.task, body.apiKeys);
      pushTrace(job, { type: "observation", content: obs.slice(0, 12000), at: nowIso() });
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: `Observation from search_knowledge:\n${obs}`,
      });
      continue;
    }

    pushTrace(job, {
      type: "error",
      content: `Could not parse agent JSON. Raw (truncated): ${raw.slice(0, 500)}`,
      at: nowIso(),
    });
    persist();
    messages.push({ role: "assistant", content: raw });
    messages.push({
      role: "user",
      content: "Invalid format. Reply with one JSON object: {\"thought\":\"...\",\"tool\":\"search_knowledge\"|\"finish\",\"tool_input\":\"...\"}",
    });
  }

  job.status = "error";
  job.error = "Max agent steps exceeded";
  persist();
}


export function createTaskJob(body: CreateTaskBody): { id: string } | { error: string } {
  if (!body.task?.trim()) {
    return { error: "task required" };
  }
  if (!body.model) {
    return { error: "model required" };
  }
  const id = nanoid();
  const taskLabel = body.task.trim().slice(0, 240);
  const job: TaskJobDto = {
    id,
    status: "pending",
    trace: [],
    createdAt: nowIso(),
    task: taskLabel,
  };
  jobs.set(id, job);
  persist();

  setImmediate(() => {
    runAgent(id, body).catch((e) => {
      const j = jobs.get(id);
      if (j) {
        j.status = "error";
        j.error = String(e);
        pushTrace(j, { type: "error", content: String(e), at: nowIso() });
        persist();
      }
    });
  });

  return { id };
}

export function getTaskJob(id: string): TaskJobDto | undefined {
  const j = jobs.get(id);
  if (!j) return undefined;
  return {
    id: j.id,
    status: j.status,
    trace: j.trace,
    result: j.result,
    error: j.error,
    createdAt: j.createdAt,
    task: j.task,
  };
}

export function listTaskSummaries(limit: number): TaskJobSummaryDto[] {
  return listRecentJobs(jobs, limit).map((j) => ({
    id: j.id,
    status: j.status,
    createdAt: j.createdAt,
    task: j.task,
  }));
}

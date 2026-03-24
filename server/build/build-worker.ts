import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CreateBuildBody } from "../../shared/build-api.ts";
import { extractHtmlDocument } from "../../shared/extract-html.ts";
import type { ChatRequestBody } from "../../shared/chat-api.ts";
import { isChatPromptJob } from "../../shared/chat-api.ts";
import { runChat } from "../lib/chat-proxy.ts";
import { buildEventBus } from "./build-event-bus.ts";

const CHUNK = 96;

function buildsRoot(): string {
  return path.resolve(process.cwd(), ".tmp", "builds");
}

async function emitLlmTokens(buildId: string, text: string): Promise<void> {
  for (let i = 0; i < text.length; i += CHUNK) {
    const token = text.slice(i, i + CHUNK);
    buildEventBus.publish(buildId, { type: "llm_token", payload: { token } });
    await new Promise<void>((r) => setImmediate(r));
  }
}

export async function startBuild(buildId: string, body: CreateBuildBody): Promise<void> {
  const root = path.join(buildsRoot(), buildId);
  await mkdir(root, { recursive: true });

  if (!isChatPromptJob(body.job)) {
    buildEventBus.publish(buildId, { type: "error", payload: { message: "Unsupported job" } });
    return;
  }

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 5, label: "Starting generation" },
  });

  const chatBody: ChatRequestBody = {
    model: body.model,
    messages: body.messages,
    apiKeys: body.apiKeys,
    promptJob: body.job,
    systemPromptExtension: body.systemPromptExtension,
    siteDesignNotes: body.siteDesignNotes,
  };

  const result = await runChat(chatBody);

  if ("error" in result) {
    buildEventBus.publish(buildId, { type: "error", payload: { message: result.error } });
    buildEventBus.publish(buildId, { type: "build_done", payload: { ok: false } });
    return;
  }

  const raw = result.content;
  await emitLlmTokens(buildId, raw);

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 45, label: "Writing artifacts" },
  });

  let mainPath: string;
  let mainContent: string;

  if (body.job === "site") {
    mainPath = "index.html";
    mainContent = extractHtmlDocument(raw);
  } else {
    mainPath = "output.txt";
    mainContent = raw;
  }

  const abs = path.join(root, mainPath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, mainContent, "utf-8");

  const snippet = mainContent.slice(0, 240);
  buildEventBus.publish(buildId, {
    type: "file_written",
    payload: { path: mainPath, snippet, bytes: Buffer.byteLength(mainContent, "utf-8") },
  });

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 60, label: "Lint (skipped locally)" },
  });
  buildEventBus.publish(buildId, {
    type: "lint_result",
    payload: { ok: true, errors: [], skipped: true },
  });

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 75, label: "Tests (skipped locally)" },
  });
  buildEventBus.publish(buildId, {
    type: "test_result",
    payload: {
      passed: 0,
      failed: 0,
      details: "No test suite executed in build monitor v1.",
    },
  });

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 90, label: "Preview" },
  });

  if (body.job === "site") {
    const url = `/api/build/${buildId}/preview`;
    buildEventBus.publish(buildId, {
      type: "preview_ready",
      payload: { url },
    });
  } else {
    buildEventBus.publish(buildId, {
      type: "preview_ready",
      payload: {
        url: null,
        reason: "Preview iframe is for HTML site builds; use the file viewer for this job.",
      },
    });
  }

  buildEventBus.publish(buildId, {
    type: "build_progress",
    payload: { percent: 100, label: "Done" },
  });
  buildEventBus.publish(buildId, { type: "build_done", payload: { ok: true } });
}

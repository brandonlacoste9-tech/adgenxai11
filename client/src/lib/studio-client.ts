import type { ChatApiKeys } from "@shared/chat-api";
import type {
  KnowledgeCollectionDto,
  KnowledgeQueryHitDto,
  TaskJobDto,
  TaskJobSummaryDto,
} from "@shared/studio-api";
import { loadStoredApiKeys } from "./api-keys";

function keys(): ChatApiKeys {
  return loadStoredApiKeys();
}

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchKnowledgeCollections(): Promise<KnowledgeCollectionDto[]> {
  const res = await fetch("/api/knowledge/collections");
  const data = await parseJson<{ collections: KnowledgeCollectionDto[] }>(res);
  return data.collections;
}

export async function createKnowledgeCollection(name: string): Promise<KnowledgeCollectionDto> {
  const res = await fetch("/api/knowledge/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await parseJson<{ collection: KnowledgeCollectionDto }>(res);
  return data.collection;
}

export async function deleteKnowledgeCollection(id: string): Promise<void> {
  const res = await fetch(`/api/knowledge/collections/${encodeURIComponent(id)}`, { method: "DELETE" });
  await parseJson<{ ok: boolean }>(res);
}

export async function uploadKnowledgeDocument(
  collectionId: string,
  fileName: string,
  payload: { textContent: string } | { base64Content: string },
): Promise<{ chunkCount: number }> {
  const res = await fetch("/api/knowledge/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collectionId,
      fileName,
      ...payload,
      apiKeys: keys(),
    }),
  });
  return parseJson<{ chunkCount: number }>(res);
}

export async function queryKnowledge(
  collectionId: string,
  query: string,
  topK = 5,
): Promise<KnowledgeQueryHitDto[]> {
  const res = await fetch("/api/knowledge/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collectionId,
      query,
      topK,
      apiKeys: keys(),
    }),
  });
  const data = await parseJson<{ hits: KnowledgeQueryHitDto[] }>(res);
  return data.hits;
}

export async function generateImage(prompt: string, size?: "1024x1024" | "1792x1024" | "1024x1792") {
  const res = await fetch("/api/images/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, size, apiKeys: keys() }),
  });
  return parseJson<{ b64Json: string; revisedPrompt?: string }>(res);
}

export async function startTask(body: {
  task: string;
  model: string;
  knowledgeCollectionId?: string;
}): Promise<string> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, apiKeys: keys() }),
  });
  const data = await parseJson<{ id: string }>(res);
  return data.id;
}

export async function fetchTaskJob(id: string): Promise<TaskJobDto> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`);
  const data = await parseJson<{ job: TaskJobDto }>(res);
  return data.job;
}

export async function fetchTaskSummaries(limit = 40): Promise<TaskJobSummaryDto[]> {
  const res = await fetch(`/api/tasks?limit=${encodeURIComponent(String(limit))}`);
  const data = await parseJson<{ jobs: TaskJobSummaryDto[] }>(res);
  return data.jobs;
}

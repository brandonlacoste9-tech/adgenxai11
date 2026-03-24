import type { ChatApiKeys } from "./chat-api.ts";

export interface KnowledgeCollectionDto {
  id: string;
  name: string;
  documentCount: number;
  chunkCount: number;
  updatedAt: string;
}

export interface KnowledgeQueryHitDto {
  docName: string;
  text: string;
  score: number;
}

export interface CreateCollectionBody {
  name: string;
}

export interface UploadKnowledgeBody {
  collectionId: string;
  fileName: string;
  /** Plain text (.txt / .md) */
  textContent?: string;
  /** Base64-encoded bytes for .pdf (server extracts text) */
  base64Content?: string;
  apiKeys?: ChatApiKeys;
}

export interface QueryKnowledgeBody {
  collectionId: string;
  query: string;
  topK?: number;
  apiKeys?: ChatApiKeys;
}

export interface GenerateImageBody {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  apiKeys?: ChatApiKeys;
}

export interface GenerateImageResponse {
  b64Json: string;
  revisedPrompt?: string;
}

export type TaskStepType = "thought" | "model" | "tool" | "observation" | "error";

export interface TaskStepDto {
  type: TaskStepType;
  content: string;
  at: string;
}

export interface CreateTaskBody {
  task: string;
  model: string;
  apiKeys?: ChatApiKeys;
  /** When set, agent can call search_knowledge against this collection */
  knowledgeCollectionId?: string;
}

export interface TaskJobDto {
  id: string;
  status: "pending" | "running" | "done" | "error";
  trace: TaskStepDto[];
  result?: string;
  error?: string;
  createdAt: string;
  /** Task prompt snippet (for history / listing) */
  task?: string;
}

export interface TaskJobSummaryDto {
  id: string;
  status: TaskJobDto["status"];
  createdAt: string;
  task?: string;
}

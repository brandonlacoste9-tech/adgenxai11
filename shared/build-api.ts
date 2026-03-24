import type { ChatApiKeys, ChatPromptJob } from "./chat-api.ts";

/** POST /api/build */
export interface CreateBuildBody {
  job: ChatPromptJob;
  model: string;
  messages: { role: "user" | "assistant"; content: string }[];
  apiKeys?: ChatApiKeys;
  systemPromptExtension?: string;
  siteDesignNotes?: string;
}

export interface CreateBuildResponse {
  buildId: string;
}

/** SSE: named events with JSON payloads (see server build-event-bus). */
export type BuildSseEvent =
  | { type: "llm_token"; payload: { token: string } }
  | { type: "file_written"; payload: { path: string; snippet: string; bytes: number } }
  | { type: "lint_result"; payload: { ok: boolean; errors?: string[]; skipped?: boolean } }
  | { type: "test_result"; payload: { passed: number; failed: number; details?: string } }
  | { type: "build_progress"; payload: { percent: number; label?: string } }
  | { type: "build_done"; payload: { ok: boolean } }
  | { type: "preview_ready"; payload: { url: string | null; reason?: string } }
  | { type: "error"; payload: { message: string } };

export const BUILD_SSE_EVENT_TYPES = [
  "llm_token",
  "file_written",
  "lint_result",
  "test_result",
  "build_progress",
  "build_done",
  "preview_ready",
  "error",
] as const;

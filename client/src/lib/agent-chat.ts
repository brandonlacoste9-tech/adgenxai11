import { apiKeyForProvider, providerForUiModel } from "@shared/chat-api";
import { loadStoredApiKeys } from "@/lib/api-keys";

/** Wizard `<Select value>` → Chat API model id. */
export function wizardModelValueToChatId(value: string): string {
  switch (value) {
    case "claude-3.5":
      return "claude-3.5-sonnet";
    case "deepseek-r1":
      return "deepseek-r1";
    case "moonshot-128k":
      return "moonshot-128k";
    case "llama-3.1":
      return "llama-3.1-70b";
    default:
      return "gpt-4.1";
  }
}

/** Map agent card model labels to Chat API model ids (see shared/chat-api). */
export function agentLabelToChatModelId(modelLabel: string): string {
  const m = modelLabel.toLowerCase();
  if (m.includes("claude")) return "claude-3.5-sonnet";
  if (m.includes("deepseek")) return "deepseek-r1";
  if (m.includes("moonshot") || m.includes("kimi")) return "moonshot-128k";
  if (m.includes("llama") || m.includes("ollama")) return "llama-3.1-70b";
  return "gpt-4.1";
}

export function canCallChatApiForModel(modelId: string): boolean {
  const p = providerForUiModel(modelId);
  if (p === "ollama") return true;
  return !!apiKeyForProvider(loadStoredApiKeys(), p);
}

export async function postChat(messages: { role: "system" | "user" | "assistant"; content: string }[], model: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      apiKeys: loadStoredApiKeys(),
    }),
  });
  const data = (await res.json()) as { content?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  if (!data.content?.trim()) {
    throw new Error("Empty model response");
  }
  return data.content;
}

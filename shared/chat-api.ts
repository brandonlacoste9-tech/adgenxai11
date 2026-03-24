export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatApiKeys {
  openai?: string;
  anthropic?: string;
  deepseek?: string;
  moonshot?: string;
  /** Ollama server root, e.g. http://127.0.0.1:11434 */
  ollamaBaseUrl?: string;
}

export interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  apiKeys?: ChatApiKeys;
}

export interface ChatResponseBody {
  content: string;
}

export interface ChatErrorBody {
  error: string;
}

export type ChatProvider = "openai" | "anthropic" | "deepseek" | "moonshot" | "ollama";

export function providerForUiModel(model: string): ChatProvider {
  switch (model) {
    case "gpt-4.1":
      return "openai";
    case "claude-3.5-sonnet":
      return "anthropic";
    case "deepseek-r1":
      return "deepseek";
    case "moonshot-128k":
      return "moonshot";
    case "llama-3.1-70b":
      return "ollama";
    default:
      return "openai";
  }
}

export function apiKeyForProvider(keys: ChatApiKeys | undefined, provider: ChatProvider): string | undefined {
  if (!keys) return undefined;
  switch (provider) {
    case "openai":
      return keys.openai?.trim() || undefined;
    case "anthropic":
      return keys.anthropic?.trim() || undefined;
    case "deepseek":
      return keys.deepseek?.trim() || undefined;
    case "moonshot":
      return keys.moonshot?.trim() || undefined;
    case "ollama":
      return undefined;
  }
}

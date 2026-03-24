import type { ChatApiKeys } from "@shared/chat-api";

export const STORAGE_KEYS = {
  openai: "adgenxai_api_openai",
  anthropic: "adgenxai_api_anthropic",
  deepseek: "adgenxai_api_deepseek",
  moonshot: "adgenxai_api_moonshot",
  ollamaBase: "adgenxai_api_ollama_base",
  github: "adgenxai_github_token",
} as const;

export type ProviderKeyId = keyof Omit<typeof STORAGE_KEYS, "ollamaBase" | "github">;

export function loadGithubToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = localStorage.getItem(STORAGE_KEYS.github);
  return v?.trim() || undefined;
}

export function saveGithubToken(token: string): void {
  if (typeof window === "undefined") return;
  if (token.trim()) localStorage.setItem(STORAGE_KEYS.github, token.trim());
  else localStorage.removeItem(STORAGE_KEYS.github);
}

export function loadStoredApiKeys(): ChatApiKeys {
  if (typeof window === "undefined") return {};
  const pick = (k: string) => {
    const v = localStorage.getItem(k);
    return v && v.trim() ? v : undefined;
  };
  return {
    openai: pick(STORAGE_KEYS.openai),
    anthropic: pick(STORAGE_KEYS.anthropic),
    deepseek: pick(STORAGE_KEYS.deepseek),
    moonshot: pick(STORAGE_KEYS.moonshot),
    ollamaBaseUrl: pick(STORAGE_KEYS.ollamaBase) ?? "http://127.0.0.1:11434",
  };
}

export function saveApiKeys(keys: {
  openai: string;
  anthropic: string;
  deepseek: string;
  moonshot: string;
  ollamaBase: string;
}): void {
  const set = (k: string, v: string) => {
    if (v.trim()) localStorage.setItem(k, v.trim());
    else localStorage.removeItem(k);
  };
  set(STORAGE_KEYS.openai, keys.openai);
  set(STORAGE_KEYS.anthropic, keys.anthropic);
  set(STORAGE_KEYS.deepseek, keys.deepseek);
  set(STORAGE_KEYS.moonshot, keys.moonshot);
  localStorage.setItem(
    STORAGE_KEYS.ollamaBase,
    keys.ollamaBase.trim() || "http://127.0.0.1:11434",
  );
}

import type { ChatMessage, ChatRequestBody, ChatProvider } from "../../shared/chat-api.ts";
import { apiKeyForProvider, isChatPromptJob } from "../../shared/chat-api.ts";
import { composeSystemPrompt } from "../agents/agentFactory.ts";

function resolveProviderModel(uiModel: string): { provider: ChatProvider; apiModel: string } {
  switch (uiModel) {
    case "gpt-4.1":
      return { provider: "openai", apiModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o" };
    case "claude-3.5-sonnet":
      return { provider: "anthropic", apiModel: "claude-3-5-sonnet-20241022" };
    case "deepseek-r1":
      return { provider: "deepseek", apiModel: "deepseek-reasoner" };
    case "moonshot-128k":
      return { provider: "moonshot", apiModel: "moonshot-v1-128k" };
    case "llama-3.1-70b":
      return { provider: "ollama", apiModel: process.env.OLLAMA_MODEL || "llama3.1:70b" };
    default:
      return { provider: "openai", apiModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o" };
  }
}

export type ChatResult = { content: string } | { error: string };

function errMessage(data: unknown): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    const e = o.error;
    if (typeof e === "string") return e;
    if (e && typeof e === "object" && typeof (e as { message?: string }).message === "string") {
      return (e as { message: string }).message;
    }
  }
  return "Request failed";
}

function openAiStyleMessages(messages: ChatMessage[]): { role: string; content: string }[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

function toAnthropicPayload(messages: ChatMessage[]): {
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const rest = messages.filter((m) => m.role !== "system") as {
    role: "user" | "assistant";
    content: string;
  }[];

  let msgs = rest.filter((m) => m.role === "user" || m.role === "assistant");
  if (msgs.length === 0) {
    msgs = [{ role: "user", content: "Hello" }];
  }
  if (msgs[0].role === "assistant") {
    msgs = [{ role: "user", content: "Please continue." }, ...msgs];
  }

  return {
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    messages: msgs,
  };
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  apiModel: string,
  messages: ChatMessage[],
): Promise<ChatResult> {
  const url = `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: apiModel,
      messages: openAiStyleMessages(messages),
      max_tokens: 4096,
    }),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    return { error: errMessage(data) };
  }
  const content = (data as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message
    ?.content;
  if (!content) {
    return { error: "Empty response from model" };
  }
  return { content };
}

async function callAnthropic(apiKey: string, apiModel: string, messages: ChatMessage[]): Promise<ChatResult> {
  const { system, messages: msgs } = toAnthropicPayload(messages);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: apiModel,
      max_tokens: 4096,
      system: system ?? undefined,
      messages: msgs,
    }),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    return { error: errMessage(data) };
  }
  const blocks = (data as { content?: { type?: string; text?: string }[] }).content;
  const text = blocks?.map((b) => (b.type === "text" ? b.text ?? "" : "")).join("") ?? "";
  if (!text) {
    return { error: "Empty response from Anthropic" };
  }
  return { content: text };
}

async function callOllama(
  baseUrl: string,
  apiModel: string,
  messages: ChatMessage[],
): Promise<ChatResult> {
  const base = baseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: apiModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    }),
  });
  const data = (await res.json()) as { message?: { content?: string }; error?: string };
  if (!res.ok) {
    return { error: data.error || errMessage(data) };
  }
  const content = data.message?.content;
  if (!content) {
    return { error: "Empty response from Ollama" };
  }
  return { content };
}

function applyPromptJob(body: ChatRequestBody): ChatMessage[] {
  if (!isChatPromptJob(body.promptJob)) {
    return body.messages;
  }
  return body.messages.filter((m) => m.role === "user" || m.role === "assistant");
}

export async function runChat(body: ChatRequestBody): Promise<ChatResult> {
  if (!body?.messages?.length) {
    return { error: "messages required" };
  }

  let messages = body.messages;
  if (isChatPromptJob(body.promptJob)) {
    try {
      const tail = applyPromptJob(body);
      if (tail.length === 0) {
        return { error: "promptJob requires at least one user or assistant message" };
      }
      const system = await composeSystemPrompt(body.promptJob, {
        extension: body.systemPromptExtension,
        siteDesignNotes: body.siteDesignNotes,
      });
      messages = [{ role: "system", content: system }, ...tail];
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  const { provider, apiModel } = resolveProviderModel(body.model);

  const envKey =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : provider === "anthropic"
        ? process.env.ANTHROPIC_API_KEY
        : provider === "deepseek"
          ? process.env.DEEPSEEK_API_KEY
          : provider === "moonshot"
            ? process.env.MOONSHOT_API_KEY
            : undefined;

  const key =
    apiKeyForProvider(body.apiKeys, provider) ||
    (typeof envKey === "string" && envKey.trim() ? envKey.trim() : undefined);

  if (provider !== "ollama" && !key) {
    return {
      error: `No API key for ${provider}. Add it in Settings or set ${provider.toUpperCase()}_API_KEY (or OPENAI_API_KEY / ANTHROPIC_API_KEY / …) on the server.`,
    };
  }

  switch (provider) {
    case "openai":
      return callOpenAiCompatible("https://api.openai.com", key!, apiModel, messages);
    case "deepseek":
      return callOpenAiCompatible("https://api.deepseek.com", key!, apiModel, messages);
    case "moonshot":
      return callOpenAiCompatible("https://api.moonshot.cn", key!, apiModel, messages);
    case "anthropic":
      return callAnthropic(key!, apiModel, messages);
    case "ollama": {
      const base =
        body.apiKeys?.ollamaBaseUrl?.trim() ||
        process.env.OLLAMA_BASE_URL ||
        "http://127.0.0.1:11434";
      return callOllama(base, apiModel, messages);
    }
    default:
      return { error: "Unknown provider" };
  }
}

export function readJsonBody(req: { on: (e: string, fn: (chunk?: Buffer) => void) => void }): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk?.toString() ?? "";
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

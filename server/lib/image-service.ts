import type { ChatApiKeys } from "../../shared/chat-api.ts";
import type { GenerateImageBody, GenerateImageResponse } from "../../shared/studio-api.ts";

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
  return "Image request failed";
}

export async function generateOpenAiImage(body: GenerateImageBody): Promise<GenerateImageResponse | { error: string }> {
  const key = body.apiKeys?.openai?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { error: "OpenAI API key required (Settings or OPENAI_API_KEY on server)." };
  }
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return { error: "prompt required" };
  }
  const size = body.size || "1024x1024";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "dall-e-3",
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
    }),
  });
  const data = (await res.json()) as {
    data?: { b64_json?: string; revised_prompt?: string }[];
    error?: unknown;
  };
  if (!res.ok) {
    return { error: errMessage(data) };
  }
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    return { error: "No image in response" };
  }
  return {
    b64Json: b64,
    revisedPrompt: data.data?.[0]?.revised_prompt,
  };
}

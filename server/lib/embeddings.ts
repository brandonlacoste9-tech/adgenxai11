const EMBED_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

export async function embedTexts(openaiKey: string, inputs: string[]): Promise<number[][] | { error: string }> {
  if (inputs.length === 0) return [];
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
  });
  const data = (await res.json()) as {
    data?: { embedding: number[]; index: number }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    return { error: data.error?.message || "Embedding request failed" };
  }
  const rows = data.data ?? [];
  rows.sort((a, b) => a.index - b.index);
  return rows.map((r) => r.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

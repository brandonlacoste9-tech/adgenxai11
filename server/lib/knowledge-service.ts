import type { ChatApiKeys } from "../../shared/chat-api.ts";
import type { KnowledgeCollectionDto, KnowledgeQueryHitDto } from "../../shared/studio-api.ts";
import { cosineSimilarity, embedTexts } from "./embeddings.ts";
import {
  addChunks,
  createCollectionRecord,
  deleteCollectionRecord,
  getCollection,
  getCollectionStats,
  listCollections as listStoredCollections,
  chunksForCollection,
} from "./knowledge-store.ts";
import { extractPdfText } from "./pdf-extract.ts";

function openaiFrom(keys: ChatApiKeys | undefined): string | undefined {
  const k = keys?.openai?.trim() || process.env.OPENAI_API_KEY?.trim();
  return k || undefined;
}

function chunkText(text: string, maxChars = 1600): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const paras = normalized.split(/\n\n+/);
  const out: string[] = [];
  let buf = "";
  for (const p of paras) {
    const next = buf ? `${buf}\n\n${p}` : p;
    if (next.length > maxChars && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = next;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter((s) => s.length > 20);
}

export function listCollections(): KnowledgeCollectionDto[] {
  return listStoredCollections().map((c) => {
    const s = getCollectionStats(c.id);
    return {
      id: c.id,
      name: c.name,
      documentCount: s.documentCount,
      chunkCount: s.chunkCount,
      updatedAt: c.updatedAt,
    };
  });
}

export function createCollection(name: string): KnowledgeCollectionDto {
  const c = createCollectionRecord(name);
  return {
    id: c.id,
    name: c.name,
    documentCount: 0,
    chunkCount: 0,
    updatedAt: c.updatedAt,
  };
}

export function deleteCollection(id: string): { ok: boolean } {
  return { ok: deleteCollectionRecord(id) };
}

const MAX_PDF_BYTES = 20 * 1024 * 1024;

export async function ingestDocument(
  collectionId: string,
  fileName: string,
  source: { text?: string; base64?: string },
  apiKeys?: ChatApiKeys,
): Promise<{ chunkCount: number } | { error: string }> {
  if (!getCollection(collectionId)) {
    return { error: "Collection not found" };
  }
  const key = openaiFrom(apiKeys);
  if (!key) {
    return { error: "OpenAI API key required for embeddings (Settings or OPENAI_API_KEY on server)." };
  }

  let fullText: string;
  const lower = (fileName || "").toLowerCase();
  const hasB64 = typeof source.base64 === "string" && source.base64.length > 0;
  const hasText = typeof source.text === "string";

  if (hasB64 && hasText) {
    return { error: "Send either textContent or base64Content, not both." };
  }
  if (hasB64) {
    if (!lower.endsWith(".pdf")) {
      return { error: "base64Content is only supported for .pdf files." };
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(source.base64!, "base64");
    } catch {
      return { error: "Invalid base64 payload." };
    }
    if (buf.length > MAX_PDF_BYTES) {
      return { error: `PDF exceeds ${MAX_PDF_BYTES / (1024 * 1024)}MB after decode.` };
    }
    try {
      fullText = await extractPdfText(buf);
    } catch (e) {
      return { error: `PDF extraction failed: ${String(e)}` };
    }
  } else if (hasText) {
    fullText = source.text!;
  } else {
    return { error: "Provide textContent or base64Content." };
  }

  const pieces = chunkText(fullText);
  if (pieces.length === 0) {
    return { error: "No text to index (file empty or too short)." };
  }
  const emb = await embedTexts(key, pieces);
  if ("error" in emb) {
    return { error: emb.error };
  }
  if (emb.length !== pieces.length) {
    return { error: "Embedding count mismatch" };
  }
  const rows = pieces.map((text, i) => ({ text, embedding: emb[i]! }));
  addChunks(collectionId, fileName || "document.txt", rows);
  return { chunkCount: rows.length };
}

export async function queryCollection(
  collectionId: string,
  query: string,
  topK: number,
  apiKeys?: ChatApiKeys,
): Promise<KnowledgeQueryHitDto[] | { error: string }> {
  if (!getCollection(collectionId)) {
    return { error: "Collection not found" };
  }
  const key = openaiFrom(apiKeys);
  if (!key) {
    return { error: "OpenAI API key required for query embeddings." };
  }
  const q = query.trim();
  if (!q) return [];
  const chunks = chunksForCollection(collectionId);
  if (chunks.length === 0) return [];
  const qEmb = await embedTexts(key, [q]);
  if ("error" in qEmb) {
    return { error: qEmb.error };
  }
  const vec = qEmb[0]!;
  const scored = chunks.map((c) => ({
    docName: c.docName,
    text: c.text,
    score: cosineSimilarity(vec, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.min(Math.max(topK, 1), 20));
}

/** Used by task runner tool (same as query but returns compact string) */
export async function searchKnowledgeForAgent(
  collectionId: string,
  query: string,
  apiKeys?: ChatApiKeys,
): Promise<string> {
  const hits = await queryCollection(collectionId, query, 5, apiKeys);
  if ("error" in hits) return `Error: ${hits.error}`;
  if (hits.length === 0) return "No matching chunks found.";
  return hits
    .map((h, i) => `[${i + 1}] (${h.docName}, score=${h.score.toFixed(3)})\n${h.text}`)
    .join("\n\n---\n\n");
}

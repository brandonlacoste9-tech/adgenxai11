import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

export interface StoredCollection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredChunk {
  id: string;
  collectionId: string;
  docName: string;
  text: string;
  embedding: number[];
}

interface StoreFile {
  collections: StoredCollection[];
  chunks: StoredChunk[];
}

function dataPath(): string {
  const root = process.env.ADGEN_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(root, "knowledge.json");
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadRaw(): StoreFile {
  const p = dataPath();
  if (!fs.existsSync(p)) {
    return { collections: [], chunks: [] };
  }
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const j = JSON.parse(raw) as StoreFile;
    return {
      collections: Array.isArray(j.collections) ? j.collections : [],
      chunks: Array.isArray(j.chunks) ? j.chunks : [],
    };
  } catch {
    return { collections: [], chunks: [] };
  }
}

function saveRaw(store: StoreFile): void {
  const p = dataPath();
  ensureDir(p);
  fs.writeFileSync(p, JSON.stringify(store, null, 0), "utf-8");
}

export function listCollections(): StoredCollection[] {
  return loadRaw().collections.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createCollectionRecord(name: string): StoredCollection {
  const store = loadRaw();
  const now = new Date().toISOString();
  const col: StoredCollection = {
    id: nanoid(),
    name: name.trim() || "Untitled",
    createdAt: now,
    updatedAt: now,
  };
  store.collections.push(col);
  saveRaw(store);
  return col;
}

export function deleteCollectionRecord(id: string): boolean {
  const store = loadRaw();
  const before = store.collections.length;
  store.collections = store.collections.filter((c) => c.id !== id);
  store.chunks = store.chunks.filter((c) => c.collectionId !== id);
  if (store.collections.length === before) return false;
  saveRaw(store);
  return true;
}

export function touchCollection(id: string): void {
  const store = loadRaw();
  const col = store.collections.find((c) => c.id === id);
  if (!col) return;
  col.updatedAt = new Date().toISOString();
  saveRaw(store);
}

export function addChunks(collectionId: string, docName: string, chunks: { text: string; embedding: number[] }[]): void {
  const store = loadRaw();
  if (!store.collections.some((c) => c.id === collectionId)) return;
  for (const ch of chunks) {
    store.chunks.push({
      id: nanoid(),
      collectionId,
      docName,
      text: ch.text,
      embedding: ch.embedding,
    });
  }
  const col = store.collections.find((c) => c.id === collectionId);
  if (col) col.updatedAt = new Date().toISOString();
  saveRaw(store);
}

export function getCollectionStats(id: string): { documentCount: number; chunkCount: number } {
  const store = loadRaw();
  const chunks = store.chunks.filter((c) => c.collectionId === id);
  const docs = new Set(chunks.map((c) => c.docName));
  return { documentCount: docs.size, chunkCount: chunks.length };
}

export function chunksForCollection(collectionId: string): StoredChunk[] {
  return loadRaw().chunks.filter((c) => c.collectionId === collectionId);
}

export function getCollection(id: string): StoredCollection | undefined {
  return loadRaw().collections.find((c) => c.id === id);
}

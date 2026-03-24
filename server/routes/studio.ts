import { Router, type Request, type Response } from "express";
import type {
  CreateCollectionBody,
  CreateTaskBody,
  GenerateImageBody,
  QueryKnowledgeBody,
  UploadKnowledgeBody,
} from "../../shared/studio-api.ts";
import { readJsonBody } from "../lib/chat-proxy.ts";
import { generateOpenAiImage } from "../lib/image-service.ts";
import * as knowledge from "../lib/knowledge-service.ts";
import { createTaskJob, getTaskJob, listTaskSummaries } from "../lib/task-service.ts";

const router = Router();

function getBody(req: Request): Promise<unknown> {
  const b = (req as Request & { body?: unknown }).body;
  if (b !== undefined && b !== null && typeof b === "object") {
    return Promise.resolve(b);
  }
  return readJsonBody(req);
}

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}

router.get("/knowledge/collections", (_req: Request, res: Response) => {
  res.json({ collections: knowledge.listCollections() });
});

router.post("/knowledge/collections", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as CreateCollectionBody;
    const name = typeof body?.name === "string" ? body.name : "";
    const col = knowledge.createCollection(name || "Untitled");
    res.json({ collection: col });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.delete("/knowledge/collections/:id", (req: Request, res: Response) => {
  const { ok } = knowledge.deleteCollection(req.params.id);
  if (!ok) {
    sendError(res, 404, "Collection not found");
    return;
  }
  res.json({ ok: true });
});

router.post("/knowledge/upload", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as UploadKnowledgeBody;
    if (!body?.collectionId) {
      sendError(res, 400, "collectionId required");
      return;
    }
    const hasText = typeof body.textContent === "string";
    const hasB64 = typeof body.base64Content === "string" && body.base64Content.length > 0;
    if (!hasText && !hasB64) {
      sendError(res, 400, "textContent or base64Content required");
      return;
    }
    if (hasText && hasB64) {
      sendError(res, 400, "send only one of textContent or base64Content");
      return;
    }
    const fileName = typeof body.fileName === "string" ? body.fileName : "document.txt";
    const result = await knowledge.ingestDocument(
      body.collectionId,
      fileName,
      hasB64 ? { base64: body.base64Content! } : { text: body.textContent! },
      body.apiKeys,
    );
    if ("error" in result) {
      sendError(res, 400, result.error);
      return;
    }
    res.json({ chunkCount: result.chunkCount });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.post("/knowledge/query", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as QueryKnowledgeBody;
    if (!body?.collectionId || typeof body.query !== "string") {
      sendError(res, 400, "collectionId and query required");
      return;
    }
    const topK = typeof body.topK === "number" ? body.topK : 5;
    const hits = await knowledge.queryCollection(body.collectionId, body.query, topK, body.apiKeys);
    if ("error" in hits) {
      sendError(res, 400, hits.error);
      return;
    }
    res.json({ hits });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.post("/images/generate", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as GenerateImageBody;
    const out = await generateOpenAiImage(body);
    if ("error" in out) {
      sendError(res, 400, out.error);
      return;
    }
    res.json(out);
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.post("/tasks", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as CreateTaskBody;
    const out = createTaskJob(body);
    if ("error" in out) {
      sendError(res, 400, out.error);
      return;
    }
    res.json({ id: out.id });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.get("/tasks", (req: Request, res: Response) => {
  const q = req.query.limit;
  const raw = Array.isArray(q) ? q[0] : q;
  const n = typeof raw === "string" ? parseInt(raw, 10) : 40;
  res.json({ jobs: listTaskSummaries(Number.isFinite(n) ? n : 40) });
});

router.get("/tasks/:id", (req: Request, res: Response) => {
  const job = getTaskJob(req.params.id);
  if (!job) {
    sendError(res, 404, "Job not found");
    return;
  }
  res.json({ job });
});

export default router;

import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type { CreateBuildBody } from "../../shared/build-api.ts";
import { isChatPromptJob } from "../../shared/chat-api.ts";
import { readJsonBody } from "../lib/chat-proxy.ts";
import { buildEventBus } from "../build/build-event-bus.ts";
import { startBuild } from "../build/build-worker.ts";

const router = Router();

function getBody(req: Request): Promise<unknown> {
  const b = req.body;
  if (b !== undefined && b !== null && typeof b === "object") {
    return Promise.resolve(b);
  }
  return readJsonBody(req);
}

function buildDir(buildId: string): string {
  return path.resolve(process.cwd(), ".tmp", "builds", buildId);
}

function safeFilePath(root: string, rel: string): string | null {
  const normalized = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.resolve(root, normalized);
  const rootResolved = path.resolve(root);
  if (!full.startsWith(rootResolved + path.sep) && full !== rootResolved) {
    return null;
  }
  return full;
}

router.post("/build", async (req: Request, res: Response) => {
  try {
    const raw = await getBody(req);
    const body = raw as Partial<CreateBuildBody>;
    if (!body.job || !isChatPromptJob(body.job)) {
      res.status(400).json({ error: "job must be a known ChatPromptJob" });
      return;
    }
    if (!body.model || typeof body.model !== "string") {
      res.status(400).json({ error: "model is required" });
      return;
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      res.status(400).json({ error: "messages required" });
      return;
    }

    const buildId = nanoid();
    buildEventBus.initBuild(buildId);

    const payload: CreateBuildBody = {
      job: body.job,
      model: body.model,
      messages: body.messages as CreateBuildBody["messages"],
      apiKeys: body.apiKeys,
      systemPromptExtension:
        typeof body.systemPromptExtension === "string" ? body.systemPromptExtension : undefined,
      siteDesignNotes: typeof body.siteDesignNotes === "string" ? body.siteDesignNotes : undefined,
    };

    void startBuild(buildId, payload).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      buildEventBus.publish(buildId, { type: "error", payload: { message } });
      buildEventBus.publish(buildId, { type: "build_done", payload: { ok: false } });
    });

    res.status(202).json({ buildId });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/build/:buildId/events", (req: Request, res: Response) => {
  const { buildId } = req.params;
  if (!buildEventBus.hasBuild(buildId)) {
    res.status(404).send("unknown buildId");
    return;
  }
  buildEventBus.attachSse(buildId, req, res);
});

router.get("/build/:buildId/file", (req: Request, res: Response) => {
  const { buildId } = req.params;
  const root = buildDir(buildId);
  if (!fs.existsSync(root)) {
    res.status(404).send("build not found");
    return;
  }
  const rel = typeof req.query.path === "string" ? req.query.path : "index.html";
  const full = safeFilePath(root, rel);
  if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.status(404).send("file not found");
    return;
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(full);
});

router.get("/build/:buildId/preview", (req: Request, res: Response) => {
  const { buildId } = req.params;
  const root = buildDir(buildId);
  const indexPath = path.join(root, "index.html");
  if (!fs.existsSync(indexPath)) {
    res.status(404).send("preview not available");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.sendFile(indexPath);
});

export default router;

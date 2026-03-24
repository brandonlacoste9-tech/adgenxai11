import { Router, type Request, type Response } from "express";
import type {
  CreateSiteBody,
  CreateSitePageBody,
  PatchSiteBody,
  PatchSitePageBody,
  PushGithubBody,
} from "../../shared/sites-api.ts";
import { readJsonBody } from "../lib/chat-proxy.ts";
import { pushSiteToGithub } from "../lib/github-push.ts";
import * as siteStore from "../lib/site-store.ts";

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

router.get("/sites", (_req: Request, res: Response) => {
  res.json({ sites: siteStore.listSites() });
});

router.post("/sites", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as CreateSiteBody;
    const name = typeof body?.name === "string" ? body.name : "";
    const site = siteStore.createSite(name || "New site", body?.designNotes);
    res.json({ site });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.get("/sites/:siteId", (req: Request, res: Response) => {
  const site = siteStore.getSite(req.params.siteId);
  if (!site) {
    sendError(res, 404, "Site not found");
    return;
  }
  res.json({ site });
});

router.patch("/sites/:siteId", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as PatchSiteBody;
    const site = siteStore.patchSite(req.params.siteId, {
      name: body?.name,
      designNotes: body?.designNotes,
    });
    if (!site) {
      sendError(res, 404, "Site not found");
      return;
    }
    res.json({ site });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.delete("/sites/:siteId", (req: Request, res: Response) => {
  if (!siteStore.deleteSite(req.params.siteId)) {
    sendError(res, 404, "Site not found");
    return;
  }
  res.json({ ok: true });
});

router.post("/sites/:siteId/pages", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as CreateSitePageBody;
    if (typeof body?.routePath !== "string") {
      sendError(res, 400, "routePath required");
      return;
    }
    const out = siteStore.addPage(req.params.siteId, body.routePath, body.title);
    if ("error" in out) {
      sendError(res, 400, out.error);
      return;
    }
    res.json({ page: out });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.patch("/sites/:siteId/pages/:pageId", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as PatchSitePageBody;
    const page = siteStore.patchPage(req.params.siteId, req.params.pageId, {
      title: body?.title,
      html: body?.html,
    });
    if (!page) {
      sendError(res, 404, "Page not found");
      return;
    }
    res.json({ page });
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

router.delete("/sites/:siteId/pages/:pageId", (req: Request, res: Response) => {
  if (!siteStore.deletePage(req.params.siteId, req.params.pageId)) {
    sendError(res, 404, "Page not found");
    return;
  }
  res.json({ ok: true });
});

router.post("/sites/:siteId/github/push", async (req: Request, res: Response) => {
  try {
    const body = (await getBody(req)) as PushGithubBody;
    const owner = typeof body.owner === "string" ? body.owner.trim() : "";
    const repo = typeof body.repo === "string" ? body.repo.trim() : "";
    if (!owner || !repo) {
      sendError(res, 400, "owner and repo required (e.g. owner=myuser, repo=my-site)");
      return;
    }
    const token =
      (typeof body.token === "string" && body.token.trim()) || process.env.GITHUB_TOKEN?.trim() || "";
    if (!token) {
      sendError(res, 400, "GitHub token required (Settings → GitHub, or GITHUB_TOKEN on server).");
      return;
    }
    const site = siteStore.getSite(req.params.siteId);
    if (!site) {
      sendError(res, 404, "Site not found");
      return;
    }
    if (site.pages.length === 0) {
      sendError(res, 400, "Add at least one page before pushing.");
      return;
    }
    const branch = (typeof body.branch === "string" && body.branch.trim()) || "main";
    const result = await pushSiteToGithub(token, owner, repo, branch, site, {
      createRepo: !!body.createRepo,
      repoDescription: body.repoDescription,
      commitMessage: body.commitMessage,
    });
    if ("error" in result) {
      sendError(res, 400, result.error);
      return;
    }
    res.json(result);
  } catch (e) {
    sendError(res, 500, String(e));
  }
});

export default router;

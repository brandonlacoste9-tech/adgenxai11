import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type { SiteDto, SitePageDto } from "../../shared/sites-api.ts";

interface StoreFile {
  sites: SiteRecord[];
}

interface SiteRecord {
  id: string;
  name: string;
  designNotes: string;
  createdAt: string;
  updatedAt: string;
  pages: SitePageRecord[];
}

interface SitePageRecord {
  id: string;
  routePath: string;
  title: string;
  html: string;
  updatedAt: string;
}

function dataPath(): string {
  const root = process.env.ADGEN_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(root, "sites.json");
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadRaw(): StoreFile {
  const p = dataPath();
  if (!fs.existsSync(p)) return { sites: [] };
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf-8")) as StoreFile;
    return { sites: Array.isArray(j.sites) ? j.sites : [] };
  } catch {
    return { sites: [] };
  }
}

function saveRaw(store: StoreFile): void {
  const p = dataPath();
  ensureDir(p);
  fs.writeFileSync(p, JSON.stringify(store, null, 0), "utf-8");
}

function toPageDto(r: SitePageRecord): SitePageDto {
  return {
    id: r.id,
    routePath: r.routePath,
    title: r.title,
    html: r.html,
    updatedAt: r.updatedAt,
  };
}

function toSiteDto(r: SiteRecord): SiteDto {
  return {
    id: r.id,
    name: r.name,
    designNotes: r.designNotes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    pages: r.pages.map(toPageDto),
  };
}

const ROUTE_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i;

export function validateRoutePath(routePath: string): string | { error: string } {
  const s = routePath.trim().toLowerCase();
  if (!s) return { error: "routePath required" };
  if (s === "index" || ROUTE_RE.test(s)) return s;
  return { error: "routePath: use index or letters, numbers, hyphens (max 63 chars)." };
}

export function listSites(): SiteDto[] {
  return loadRaw().sites.map(toSiteDto).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSite(id: string): SiteDto | undefined {
  const s = loadRaw().sites.find((x) => x.id === id);
  return s ? toSiteDto(s) : undefined;
}

const INDEX_PLACEHOLDER = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Home</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-zinc-950 text-zinc-200 p-8 font-sans">
  <p class="text-zinc-400">Open this page in <strong class="text-white">Code Builder</strong> to generate your site.</p>
</body>
</html>`;

export function createSite(name: string, designNotes?: string): SiteDto {
  const store = loadRaw();
  const now = new Date().toISOString();
  const indexPage: SitePageRecord = {
    id: nanoid(),
    routePath: "index",
    title: "Home",
    html: INDEX_PLACEHOLDER,
    updatedAt: now,
  };
  const rec: SiteRecord = {
    id: nanoid(),
    name: name.trim() || "Untitled site",
    designNotes: (designNotes ?? "").trim(),
    createdAt: now,
    updatedAt: now,
    pages: [indexPage],
  };
  store.sites.push(rec);
  saveRaw(store);
  return toSiteDto(rec);
}

export function patchSite(id: string, patch: { name?: string; designNotes?: string }): SiteDto | undefined {
  const store = loadRaw();
  const rec = store.sites.find((x) => x.id === id);
  if (!rec) return undefined;
  const now = new Date().toISOString();
  if (typeof patch.name === "string") rec.name = patch.name.trim() || rec.name;
  if (typeof patch.designNotes === "string") rec.designNotes = patch.designNotes.trim();
  rec.updatedAt = now;
  saveRaw(store);
  return toSiteDto(rec);
}

export function deleteSite(id: string): boolean {
  const store = loadRaw();
  const before = store.sites.length;
  store.sites = store.sites.filter((x) => x.id !== id);
  if (store.sites.length === before) return false;
  saveRaw(store);
  return true;
}

export function addPage(siteId: string, routePath: string, title?: string): SitePageDto | { error: string } {
  const v = validateRoutePath(routePath);
  if (typeof v === "object") return v;
  const store = loadRaw();
  const site = store.sites.find((x) => x.id === siteId);
  if (!site) return { error: "Site not found" };
  if (site.pages.some((p) => p.routePath === v)) {
    return { error: "A page with this route already exists." };
  }
  const now = new Date().toISOString();
  const placeholder = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title || v}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-zinc-950 text-zinc-200 p-8 font-sans">
  <p class="text-zinc-400">New page <strong class="text-white">${v}</strong> — generate in Code Builder.</p>
</body>
</html>`;
  const page: SitePageRecord = {
    id: nanoid(),
    routePath: v,
    title: (title?.trim() || v).slice(0, 120),
    html: placeholder,
    updatedAt: now,
  };
  site.pages.push(page);
  site.updatedAt = now;
  saveRaw(store);
  return toPageDto(page);
}

export function patchPage(
  siteId: string,
  pageId: string,
  patch: { title?: string; html?: string },
): SitePageDto | undefined {
  const store = loadRaw();
  const site = store.sites.find((x) => x.id === siteId);
  if (!site) return undefined;
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) return undefined;
  const now = new Date().toISOString();
  if (typeof patch.title === "string") page.title = patch.title.trim().slice(0, 120) || page.title;
  if (typeof patch.html === "string") {
    page.html = patch.html;
    page.updatedAt = now;
  }
  site.updatedAt = now;
  saveRaw(store);
  return toPageDto(page);
}

export function deletePage(siteId: string, pageId: string): boolean {
  const store = loadRaw();
  const site = store.sites.find((x) => x.id === siteId);
  if (!site) return false;
  const before = site.pages.length;
  site.pages = site.pages.filter((p) => p.id !== pageId);
  if (site.pages.length === before) return false;
  site.updatedAt = new Date().toISOString();
  saveRaw(store);
  return true;
}

export function pageFileName(routePath: string): string {
  return routePath === "index" ? "index.html" : `${routePath}.html`;
}

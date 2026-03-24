import type {
  PushGithubBody,
  PushGithubResult,
  SiteDto,
  SitePageDto,
} from "@shared/sites-api";
import { loadGithubToken } from "./api-keys";

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchSites(): Promise<SiteDto[]> {
  const res = await fetch("/api/sites");
  const data = await parseJson<{ sites: SiteDto[] }>(res);
  return data.sites;
}

export async function fetchSite(siteId: string): Promise<SiteDto> {
  const res = await fetch(`/api/sites/${encodeURIComponent(siteId)}`);
  const data = await parseJson<{ site: SiteDto }>(res);
  return data.site;
}

export async function createSite(name: string, designNotes?: string): Promise<SiteDto> {
  const res = await fetch("/api/sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, designNotes }),
  });
  const data = await parseJson<{ site: SiteDto }>(res);
  return data.site;
}

export async function patchSite(
  siteId: string,
  patch: { name?: string; designNotes?: string },
): Promise<SiteDto> {
  const res = await fetch(`/api/sites/${encodeURIComponent(siteId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<{ site: SiteDto }>(res);
  return data.site;
}

export async function deleteSite(siteId: string): Promise<void> {
  const res = await fetch(`/api/sites/${encodeURIComponent(siteId)}`, { method: "DELETE" });
  await parseJson<{ ok: boolean }>(res);
}

export async function addSitePage(siteId: string, routePath: string, title?: string): Promise<SitePageDto> {
  const res = await fetch(`/api/sites/${encodeURIComponent(siteId)}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routePath, title }),
  });
  const data = await parseJson<{ page: SitePageDto }>(res);
  return data.page;
}

export async function patchSitePage(
  siteId: string,
  pageId: string,
  patch: { title?: string; html?: string },
): Promise<SitePageDto> {
  const res = await fetch(
    `/api/sites/${encodeURIComponent(siteId)}/pages/${encodeURIComponent(pageId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  const data = await parseJson<{ page: SitePageDto }>(res);
  return data.page;
}

export async function deleteSitePage(siteId: string, pageId: string): Promise<void> {
  const res = await fetch(
    `/api/sites/${encodeURIComponent(siteId)}/pages/${encodeURIComponent(pageId)}`,
    { method: "DELETE" },
  );
  await parseJson<{ ok: boolean }>(res);
}

export async function pushSiteToGithub(
  siteId: string,
  body: Omit<PushGithubBody, "token"> & { token?: string },
): Promise<PushGithubResult> {
  const token = body.token?.trim() || loadGithubToken();
  const res = await fetch(`/api/sites/${encodeURIComponent(siteId)}/github/push`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      token: token || undefined,
    }),
  });
  return parseJson<PushGithubResult>(res);
}

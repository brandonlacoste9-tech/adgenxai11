import type { PushGithubResult, SiteDto } from "../../shared/sites-api.ts";
import { pageFileName } from "./site-store.ts";

const GH_API = "https://api.github.com";
const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

async function gh<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      ...GH_HEADERS,
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as T;
  return { ok: res.ok, status: res.status, data };
}

function errMsg(data: unknown): string {
  if (data && typeof data === "object") {
    const m = (data as { message?: string }).message;
    if (typeof m === "string") return m;
  }
  return "GitHub API error";
}

export async function createUserRepo(
  token: string,
  name: string,
  description?: string,
): Promise<{ ok: true } | { error: string }> {
  const { ok, data } = await gh<{ message?: string }>(token, "POST", "/user/repos", {
    name,
    description: description?.slice(0, 350) || "Site from AdGenXAI studio",
    private: false,
    auto_init: true,
  });
  if (!ok) {
    if (typeof (data as { errors?: { message?: string }[] }).errors?.[0]?.message === "string") {
      return { error: (data as { errors: { message: string }[] }).errors[0].message };
    }
    return { error: errMsg(data) };
  }
  return { ok: true };
}

async function resolveBranchHead(
  token: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<{ sha: string } | { error: string }> {
  let { ok, data } = await gh<{ object?: { sha?: string }; message?: string }>(
    token,
    "GET",
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
  );
  if (ok && data.object?.sha) {
    return { sha: data.object.sha };
  }
  const repoInfo = await gh<{ default_branch?: string; message?: string }>(
    token,
    "GET",
    `/repos/${owner}/${repo}`,
  );
  if (!repoInfo.ok) {
    return { error: errMsg(repoInfo.data) };
  }
  const def = repoInfo.data.default_branch || "main";
  const ref = await gh<{ object?: { sha?: string } }>(
    token,
    "GET",
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(def)}`,
  );
  if (!ref.ok || !ref.data.object?.sha) {
    return { error: `Could not resolve branch head (tried ${branch} and ${def}).` };
  }
  return { sha: ref.data.object.sha };
}

export async function pushSiteToGithub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  site: SiteDto,
  options: { createRepo?: boolean; repoDescription?: string; commitMessage?: string },
): Promise<PushGithubResult | { error: string }> {
  const repoCheck = await gh<unknown>(token, "GET", `/repos/${owner}/${repo}`);
  if (!repoCheck.ok && repoCheck.status === 404 && options.createRepo) {
    const cr = await createUserRepo(token, repo, options.repoDescription);
    if ("error" in cr) return cr;
  } else if (!repoCheck.ok) {
    return { error: errMsg(repoCheck.data) };
  }

  const head = await resolveBranchHead(token, owner, repo, branch);
  if ("error" in head) return head;

  const commitRes = await gh<{ tree?: { sha?: string }; parents?: { sha: string }[] }>(
    token,
    "GET",
    `/repos/${owner}/${repo}/git/commits/${head.sha}`,
  );
  if (!commitRes.ok || !commitRes.data.tree?.sha) {
    return { error: "Could not read base commit tree." };
  }
  const baseTreeSha = commitRes.data.tree.sha;

  const blobShas: { path: string; sha: string }[] = [];
  for (const p of site.pages) {
    const path = pageFileName(p.routePath);
    const contentB64 = Buffer.from(p.html, "utf-8").toString("base64");
    const blob = await gh<{ sha?: string }>(token, "POST", `/repos/${owner}/${repo}/git/blobs`, {
      content: contentB64,
      encoding: "base64",
    });
    if (!blob.ok || !blob.data.sha) {
      return { error: `Blob failed for ${path}: ${errMsg(blob.data)}` };
    }
    blobShas.push({ path, sha: blob.data.sha });
  }

  const readme = `# ${site.name}\n\nStatic pages exported from the AdGenXAI studio.\n\n## Pages\n\n${site.pages
    .map((p) => `- [\`${pageFileName(p.routePath)}\`](./${pageFileName(p.routePath)}) — ${p.title}`)
    .join("\n")}\n`;
  const readmeB64 = Buffer.from(readme, "utf-8").toString("base64");
  const readmeBlob = await gh<{ sha?: string }>(token, "POST", `/repos/${owner}/${repo}/git/blobs`, {
    content: readmeB64,
    encoding: "base64",
  });
  if (!readmeBlob.ok || !readmeBlob.data.sha) {
    return { error: `README blob failed: ${errMsg(readmeBlob.data)}` };
  }
  blobShas.push({ path: "README.md", sha: readmeBlob.data.sha });

  const tree = await gh<{ sha?: string }>(token, "POST", `/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseTreeSha,
    tree: blobShas.map((b) => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  });
  if (!tree.ok || !tree.data.sha) {
    return { error: `Tree failed: ${errMsg(tree.data)}` };
  }

  const message =
    options.commitMessage?.trim() ||
    `Update site: ${site.name} (${site.pages.length} page${site.pages.length === 1 ? "" : "s"})`;

  const commit = await gh<{ sha?: string }>(token, "POST", `/repos/${owner}/${repo}/git/commits`, {
    message,
    tree: tree.data.sha,
    parents: [head.sha],
  });
  if (!commit.ok || !commit.data.sha) {
    return { error: `Commit failed: ${errMsg(commit.data)}` };
  }

  const updateRef = await gh<unknown>(
    token,
    "PATCH",
    `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
    { sha: commit.data.sha },
  );
  if (!updateRef.ok) {
    const createRef = await gh<unknown>(token, "POST", `/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branch}`,
      sha: commit.data.sha,
    });
    if (!createRef.ok) {
      return { error: `Could not update ref: ${errMsg(updateRef.data)}` };
    }
  }

  const htmlUrl = `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch)}`;
  return { commitSha: commit.data.sha, branch, htmlUrl };
}

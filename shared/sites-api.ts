/** Multi-page static sites built in the studio (stored on the server). */

export interface SitePageDto {
  id: string;
  routePath: string;
  title: string;
  html: string;
  updatedAt: string;
}

export interface SiteDto {
  id: string;
  name: string;
  designNotes: string;
  createdAt: string;
  updatedAt: string;
  pages: SitePageDto[];
}

export interface CreateSiteBody {
  name: string;
  designNotes?: string;
}

export interface PatchSiteBody {
  name?: string;
  designNotes?: string;
}

export interface CreateSitePageBody {
  routePath: string;
  title?: string;
}

export interface PatchSitePageBody {
  title?: string;
  html?: string;
}

export interface PushGithubBody {
  /** Defaults to token in Settings (client sends apiKeys.github) */
  token?: string;
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
  /** Create a new public repo under the token user if missing */
  createRepo?: boolean;
  repoDescription?: string;
}

export interface PushGithubResult {
  commitSha: string;
  branch: string;
  htmlUrl: string;
  /** Typical project-site URL after GitHub Pages is enabled */
  githubPagesUrl: string;
  /** Direct link to enable/configure Pages */
  pagesSettingsUrl: string;
  /** Short reminder for the UI */
  pagesHint: string;
}

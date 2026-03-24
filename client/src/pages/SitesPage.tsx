/* ═══════════════════════════════════════════════════════
   Sites — multi-page HTML projects + GitHub push
   ═══════════════════════════════════════════════════════ */

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Github,
  Loader2,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { PushGithubResult, SiteDto, SitePageDto } from "@shared/sites-api";
import {
  addSitePage,
  createSite,
  deleteSite,
  deleteSitePage,
  fetchSite,
  fetchSites,
  patchSite,
  pushSiteToGithub,
} from "@/lib/sites-client";

function pageHref(siteId: string, pageId: string): string {
  return `/code?site=${encodeURIComponent(siteId)}&page=${encodeURIComponent(pageId)}`;
}

export default function SitesPage() {
  const [, setLocation] = useLocation();
  const [matchDetail, params] = useRoute("/sites/:siteId");
  const siteId = matchDetail ? params?.siteId : undefined;

  const [list, setList] = useState<SiteDto[]>([]);
  const [site, setSite] = useState<SiteDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSiteName, setNewSiteName] = useState("");
  const [designDraft, setDesignDraft] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  const [ghOpen, setGhOpen] = useState(false);
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghCreate, setGhCreate] = useState(true);
  const [ghBusy, setGhBusy] = useState(false);
  const [ghSuccess, setGhSuccess] = useState<PushGithubResult | null>(null);

  const refreshList = useCallback(async () => {
    try {
      setList(await fetchSites());
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const s = await fetchSite(id);
      setSite(s);
      setDesignDraft(s.designNotes);
    } catch (e) {
      toast.error(String(e));
      setLocation("/sites");
    }
  }, [setLocation]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (siteId) {
      void loadDetail(siteId);
    } else {
      setSite(null);
    }
  }, [siteId, loadDetail]);

  const handleCreateSite = async () => {
    try {
      const s = await createSite(newSiteName.trim() || "My website");
      setNewSiteName("");
      toast.success("Site created with a Home (index) page.");
      await refreshList();
      setLocation(`/sites/${s.id}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleSaveDesign = async () => {
    if (!site) return;
    try {
      const s = await patchSite(site.id, { designNotes: designDraft });
      setSite(s);
      toast.success("Design notes saved.");
      await refreshList();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleAddPage = async () => {
    if (!site || !newRoute.trim()) return;
    try {
      const p = await addSitePage(site.id, newRoute.trim(), newPageTitle.trim() || undefined);
      setNewRoute("");
      setNewPageTitle("");
      toast.success(`Page ${p.routePath} added`);
      await loadDetail(site.id);
      await refreshList();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleDeletePage = async (page: SitePageDto) => {
    if (!site) return;
    if (page.routePath === "index") {
      toast.error("Cannot delete the Home (index) page.");
      return;
    }
    if (!confirm(`Delete page “${page.title}” (${page.routePath})?`)) return;
    try {
      await deleteSitePage(site.id, page.id);
      toast.success("Page deleted");
      await loadDetail(site.id);
      await refreshList();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleDeleteSite = async () => {
    if (!site) return;
    if (!confirm(`Delete site “${site.name}” and all pages?`)) return;
    try {
      await deleteSite(site.id);
      toast.success("Site deleted");
      setLocation("/sites");
      await refreshList();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleGithubPush = async () => {
    if (!site) return;
    if (!ghOwner.trim() || !ghRepo.trim()) {
      toast.error("Owner and repository name are required.");
      return;
    }
    setGhBusy(true);
    try {
      const out = await pushSiteToGithub(site.id, {
        owner: ghOwner.trim(),
        repo: ghRepo.trim().replace(/\.git$/i, ""),
        branch: ghBranch.trim() || "main",
        createRepo: ghCreate,
      });
      setGhSuccess(out);
      toast.success("Pushed — opening GitHub Pages settings.");
      window.open(out.pagesSettingsUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setGhBusy(false);
    }
  };

  if (siteId && site) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/sites">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <h1 className="font-heading font-semibold truncate">{site.name}</h1>
            <Badge variant="secondary" className="text-xs shrink-0">
              {site.pages.length} page{site.pages.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 bg-transparent" onClick={() => setGhOpen(true)}>
              <Github className="h-3.5 w-3.5" /> Push to GitHub
            </Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleDeleteSite}>
              <Trash2 className="h-3.5 w-3.5" /> Delete site
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 max-w-3xl space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-heading">Site-wide design notes (used in Code Builder)</Label>
              <Textarea
                value={designDraft}
                onChange={(e) => setDesignDraft(e.target.value)}
                placeholder="Brand colors, typography, tone, shared layout rules for every page…"
                className="min-h-[100px] bg-input/30 border-border/40 font-heading text-sm"
              />
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={handleSaveDesign}>
                <Pencil className="h-3.5 w-3.5" /> Save notes
              </Button>
            </div>

            <div className="rounded-xl border border-border/40 bg-card/40 p-4 space-y-3">
              <h2 className="text-sm font-heading font-semibold">Pages</h2>
              <ul className="space-y-2">
                {site.pages.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/30 px-3 py-2 bg-background/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {p.routePath === "index" ? "index.html" : `${p.routePath}.html`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent gap-1" asChild>
                        <Link href={pageHref(site.id, p.id)}>
                          <Code2 className="h-3 w-3" /> Code Builder
                        </Link>
                      </Button>
                      {p.routePath !== "index" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => void handleDeletePage(p)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <Input
                  placeholder="route (e.g. about, pricing)"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  className="h-9 flex-1 min-w-[140px] bg-input/30 text-sm"
                />
                <Input
                  placeholder="title (optional)"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="h-9 flex-1 min-w-[120px] bg-input/30 text-sm"
                />
                <Button size="sm" className="h-9 gap-1" onClick={handleAddPage} disabled={!newRoute.trim()}>
                  <Plus className="h-3.5 w-3.5" /> Add page
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Add a{" "}
              <a
                className="text-primary hover:underline inline-flex items-center gap-0.5"
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub token <ExternalLink className="h-3 w-3" />
              </a>{" "}
              in Settings (repo scope). “Create repo” makes a new public repository under your account. For organization
              repos, create the empty repo on GitHub first, then push with “Create repo” off.
            </p>
          </div>
        </ScrollArea>

        <Dialog
          open={ghOpen}
          onOpenChange={(open) => {
            setGhOpen(open);
            if (!open) setGhSuccess(null);
          }}
        >
          <DialogContent className="max-w-md">
            {ghSuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading">Push complete</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{ghSuccess.pagesHint}</p>
                <div className="space-y-2 py-2">
                  <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs font-mono break-all">
                    {ghSuccess.githubPagesUrl}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent gap-1" asChild>
                      <a href={ghSuccess.pagesSettingsUrl} target="_blank" rel="noopener noreferrer">
                        Pages settings <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent gap-1"
                      onClick={() => {
                        void navigator.clipboard.writeText(ghSuccess.githubPagesUrl);
                        toast.success("Pages URL copied");
                      }}
                    >
                      Copy Pages URL
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent gap-1" asChild>
                      <a href={ghSuccess.htmlUrl} target="_blank" rel="noopener noreferrer">
                        View files <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setGhOpen(false)}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading flex items-center gap-2">
                    <Github className="h-5 w-5" /> Push to GitHub
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Owner (GitHub username)</Label>
                    <Input value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="octocat" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Repository name</Label>
                    <Input value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="my-landing-page" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Branch</Label>
                    <Input value={ghBranch} onChange={(e) => setGhBranch(e.target.value)} placeholder="main" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={ghCreate} onCheckedChange={(v) => setGhCreate(v === true)} />
                    Create repository if it does not exist (your account only)
                  </label>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGhOpen(false)} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={() => void handleGithubPush()} disabled={ghBusy}>
                    {ghBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                    Push
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (siteId && !site) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading site…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Sites</h1>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Multi-page HTML
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            placeholder="New site name…"
            className="h-9 w-44 bg-input/30 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreateSite()}
          />
          <Button size="sm" className="gap-1.5 h-9" onClick={handleCreateSite}>
            <Plus className="h-3.5 w-3.5" /> New site
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <div className="max-w-md text-center mx-auto py-16">
            <Globe className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <h2 className="font-heading font-semibold mb-2">No sites yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create a site to get an <code className="text-xs bg-muted/50 px-1 rounded">index.html</code> home page. Open
              pages in Code Builder to generate with AI, then push the folder to GitHub.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sites/${s.id}`}
                  className="block rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 hover:bg-card/80 transition-colors"
                >
                  <p className="font-heading font-semibold truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.pages.length} page{s.pages.length === 1 ? "" : "s"} · updated {new Date(s.updatedAt).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

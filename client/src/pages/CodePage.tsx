/* ═══════════════════════════════════════════════════════
   Code Builder — AdGenXAI Amber Atelier
   Prompt-to-code with live preview panel.
   OpenClaw agent integration: select any installed agent
   to drive code generation with its system prompt + model.
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Play, Copy, Download, Sparkles, Eye, FileCode,
  Wand2, RotateCcw, ExternalLink, Bot, ChevronDown, X,
  Zap, CheckCircle2, MessageSquare, Layers, Settings2,
  ArrowRight, Cpu, Save, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAgent, ActiveAgent } from "@/contexts/AgentContext";
import { Link, useSearch } from "wouter";
import { agentLabelToChatModelId, canCallChatApiForModel, postChat } from "@/lib/agent-chat";
import type { SiteDto, SitePageDto } from "@shared/sites-api";
import { fetchSite, patchSitePage } from "@/lib/sites-client";

function htmlFileLabel(routePath: string): string {
  return routePath === "index" ? "index.html" : `${routePath}.html`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─── Placeholder preview; generation uses /api/chat ─── */

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Preview</title></head>
<body class="min-h-screen bg-zinc-950 p-8 font-sans text-zinc-400">
  <p>Add API keys in <strong class="text-zinc-200">Settings</strong>, describe what you want, then <strong class="text-zinc-200">Generate</strong>. The model returns one HTML document via the same <code class="text-amber-400/90">/api/chat</code> route as Chat Studio.</p>
</body>
</html>`;

function extractHtmlDocument(reply: string): string {
  const trimmed = reply.trim();
  const fullFence = trimmed.match(/^```(?:html)?\s*([\s\S]*?)```/im);
  if (fullFence) return fullFence[1].trim();
  const inner = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (inner) return inner[1].trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return trimmed;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Output</title></head><body class="p-6"><pre>${escapeHtml(trimmed)}</pre></body></html>`;
}

const TEMPLATES = [
  { name: "Landing Page", prompt: "Build a modern dark-mode SaaS landing page with hero, features, and pricing" },
  { name: "Dashboard", prompt: "Create an analytics dashboard with charts, stats cards, and sidebar navigation" },
  { name: "Portfolio", prompt: "Design a minimal portfolio site with project grid and about section" },
  { name: "Blog", prompt: "Generate a blog layout with article cards, categories, and search" },
  { name: "API Docs", prompt: "Build a developer documentation page with code examples and endpoint reference" },
];

/* ─── Agent Picker Dialog ────────────────────────────── */
function AgentPickerDialog({
  open,
  onClose,
  installedAgents,
  activeAgent,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  installedAgents: ActiveAgent[];
  activeAgent: ActiveAgent | null;
  onSelect: (agent: ActiveAgent | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Select OpenClaw Agent
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {/* No agent option */}
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
              !activeAgent ? "border-primary/40 bg-primary/5" : "border-border/40 hover:border-primary/20 hover:bg-muted/20"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-heading font-medium">Default (No Agent)</p>
              <p className="text-xs text-muted-foreground">Standard code generation</p>
            </div>
            {!activeAgent && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
          </button>

          {installedAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No agents installed yet</p>
              <Link href="/agents" onClick={onClose}>
                <Button size="sm" variant="outline" className="font-heading gap-1.5 bg-transparent text-xs">
                  <ArrowRight className="h-3.5 w-3.5" /> Open Agents
                </Button>
              </Link>
            </div>
          ) : (
            <ScrollArea className="max-h-[320px]">
              <div className="space-y-2 pr-1">
                {installedAgents.map((agent) => {
                  const isActive = activeAgent?.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => { onSelect(agent); onClose(); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                        isActive ? "border-primary/40 bg-primary/5" : "border-border/40 hover:border-primary/20 hover:bg-muted/20"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0`}>
                        <Bot className={`h-4 w-4 ${agent.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-heading font-medium truncate">{agent.name}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{agent.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{agent.model}</p>
                      </div>
                      {isActive && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function CodePage() {
  const { activeAgent, setActiveAgent, installedAgents } = useAgent();
  const search = useSearch();
  const sp = new URLSearchParams(search);
  const qSite = sp.get("site") ?? undefined;
  const qPage = sp.get("page") ?? undefined;

  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(PLACEHOLDER_HTML);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [siteCtx, setSiteCtx] = useState<SiteDto | null>(null);
  const [pageCtx, setPageCtx] = useState<SitePageDto | null>(null);

  useEffect(() => {
    if (!qSite || !qPage) {
      setSiteCtx(null);
      setPageCtx(null);
      return;
    }
    let cancelled = false;
    void fetchSite(qSite)
      .then((s) => {
        if (cancelled) return;
        const p = s.pages.find((x) => x.id === qPage);
        if (p) {
          setSiteCtx(s);
          setPageCtx(p);
          setCode(p.html);
        } else {
          toast.error("That page was not found on the site.");
          setSiteCtx(s);
          setPageCtx(null);
        }
      })
      .catch((e) => {
        if (!cancelled) toast.error(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [qSite, qPage]);

  const handleSaveToSite = useCallback(async () => {
    if (!siteCtx || !pageCtx) return;
    try {
      const p = await patchSitePage(siteCtx.id, pageCtx.id, { html: code });
      setPageCtx(p);
      toast.success(`Saved ${htmlFileLabel(p.routePath)}`);
    } catch (e) {
      toast.error(String(e));
    }
  }, [siteCtx, pageCtx, code]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    const modelId = agentLabelToChatModelId(activeAgent?.model || "GPT-4.1");
    if (!canCallChatApiForModel(modelId)) {
      toast.error("Add an API key in Settings for this model (or run Ollama for local Llama).");
      return;
    }
    setIsGenerating(true);
    setShowLog(true);
    setGenerationLog([]);
    const addLog = (msg: string) => setGenerationLog((prev) => [...prev, msg]);
    addLog(`[chat] ${modelId}`);

    const systemBase =
      activeAgent?.systemPrompt?.trim() ||
      "You are an expert web developer. Respond with exactly one complete HTML5 document.";
    let system = `${systemBase}\nOutput raw HTML only (optionally wrapped in a single \`\`\`html code fence). Use Tailwind via CDN if you need styling.`;
    if (siteCtx?.designNotes?.trim()) {
      system += `\n\nSite-wide design brief (keep consistent with other pages on this site):\n${siteCtx.designNotes.trim()}`;
    }
    const user =
      pageCtx && siteCtx
        ? `You are editing the page "${pageCtx.title}" (output will be saved as ${htmlFileLabel(pageCtx.routePath)}) for the site "${siteCtx.name}".\n\nBuild a single self-contained HTML5 document for:\n\n${prompt.trim()}`
        : `Build a single self-contained HTML page for:\n\n${prompt.trim()}`;

    try {
      const raw = await postChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        modelId,
      );
      setCode(extractHtmlDocument(raw));
      addLog("[done] preview updated");
      setActiveTab("preview");
      toast.success(activeAgent ? `${activeAgent.name} — HTML updated` : "HTML updated");
    } catch (e) {
      toast.error(String(e));
      addLog(`[error] ${String(e)}`);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, activeAgent, siteCtx, pageCtx]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pageCtx ? htmlFileLabel(pageCtx.routePath) : "app.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${pageCtx ? htmlFileLabel(pageCtx.routePath) : "app.html"}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Code Builder</h1>
          <Badge variant="secondary" className="text-xs font-heading">
            <Eye className="h-3 w-3 mr-1" /> Live Preview
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent selector button */}
          <button
            onClick={() => setShowAgentPicker(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-heading transition-all ${
              activeAgent
                ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                : "border-border/40 bg-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            {activeAgent ? (
              <span className="max-w-[120px] truncate">{activeAgent.name}</span>
            ) : (
              <span>No Agent</span>
            )}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
          <Separator orientation="vertical" className="h-5 opacity-30" />
          {siteCtx && pageCtx && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 font-heading text-xs"
              onClick={() => void handleSaveToSite()}
            >
              <Save className="h-3.5 w-3.5" /> Save to site
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent font-heading text-xs" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent font-heading text-xs" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>
      </div>

      {/* Active agent banner */}
      <AnimatePresence>
        {activeAgent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/15">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                <Bot className={`h-3.5 w-3.5 ${activeAgent.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className="text-xs font-heading font-semibold text-primary">{activeAgent.name}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">is driving code generation</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{activeAgent.category}</Badge>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    <Cpu className="h-2.5 w-2.5 mr-1" />{activeAgent.model}
                  </Badge>
                  {activeAgent.tools.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      <Zap className="h-2.5 w-2.5 mr-1" />{activeAgent.tools.length} tools
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveAgent(null)}
                className="text-muted-foreground hover:text-foreground transition shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt bar */}
      <div className="px-4 py-3 border-b border-border/40 bg-card/30 shrink-0">
        <div className="flex gap-2 max-w-4xl">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder={
              activeAgent
                ? `Ask ${activeAgent.name} to build something...`
                : "Describe the app or website you want to build..."
            }
            className="flex-1 h-10 bg-input/30 border-border/40 font-heading text-sm"
            disabled={isGenerating}
          />
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="gap-1.5 font-heading text-sm">
            {isGenerating ? (
              <><RotateCcw className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="h-4 w-4" /> {activeAgent ? `Ask ${activeAgent.name.split(" ")[0]}` : "Generate"}</>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {TEMPLATES.map((t) => (
            <Button
              key={t.name}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent font-heading h-7"
              onClick={() => setPrompt(t.prompt)}
            >
              {t.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Generation log */}
      <AnimatePresence>
        {showLog && generationLog.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40 bg-[oklch(0.14_0.02_55)]"
          >
            <div className="flex items-center justify-between px-4 py-1.5">
              <span className="text-xs font-mono text-muted-foreground">Generation Log</span>
              {!isGenerating && (
                <button onClick={() => setShowLog(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="px-4 pb-2 space-y-0.5 max-h-24 overflow-y-auto">
              {generationLog.map((log, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-mono text-green-400/80"
                >
                  {log}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — code + preview */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 shrink-0">
            <TabsList className="bg-muted/30">
              <TabsTrigger value="preview" className="gap-1.5 font-heading text-xs">
                <Eye className="h-3.5 w-3.5" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5 font-heading text-xs">
                <FileCode className="h-3.5 w-3.5" /> Code
              </TabsTrigger>
              {activeAgent && (
                <TabsTrigger value="agent" className="gap-1.5 font-heading text-xs">
                  <Bot className="h-3.5 w-3.5" /> Agent
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 p-4 pt-2 overflow-hidden">
            <div className="h-full rounded-xl border border-border/40 overflow-hidden bg-white relative">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-500 border border-gray-200 flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" />
                    {activeAgent ? `openclaw://${activeAgent.name.toLowerCase().replace(/\s+/g, "-")}` : "localhost:3000"}
                  </div>
                </div>
                {activeAgent && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Bot className="h-3 w-3" />
                    <span>{activeAgent.name}</span>
                  </div>
                )}
              </div>
              <iframe
                srcDoc={code}
                className="w-full h-[calc(100%-40px)]"
                sandbox="allow-scripts"
                title="Live Preview"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 p-4 pt-2 overflow-hidden">
            <ScrollArea className="h-full rounded-xl border border-border/40 bg-[oklch(0.14_0.02_55)]">
              <pre className="p-4 text-sm font-mono text-foreground/90 leading-relaxed">
                <code>{code}</code>
              </pre>
            </ScrollArea>
          </TabsContent>

          {activeAgent && (
            <TabsContent value="agent" className="flex-1 p-4 pt-2 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 max-w-2xl">
                  {/* Agent identity */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Bot className={`h-6 w-6 ${activeAgent.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold">{activeAgent.name}</h3>
                      <p className="text-sm text-muted-foreground">{activeAgent.description}</p>
                    </div>
                    <Badge variant="default" className="text-xs font-heading">Active</Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Model", value: activeAgent.model, icon: Cpu },
                      { label: "Category", value: activeAgent.category, icon: Layers },
                      { label: "Temperature", value: activeAgent.temperature?.toFixed(1) ?? "0.5", icon: Settings2 },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                        <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-heading font-semibold mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* System prompt */}
                  <div className="space-y-2">
                    <p className="text-sm font-heading font-medium flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> System Prompt
                    </p>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {activeAgent.systemPrompt || "No system prompt configured."}
                      </pre>
                    </div>
                  </div>

                  {/* Tools */}
                  {activeAgent.tools.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-heading font-medium flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-primary" /> Enabled Tools
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeAgent.tools.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs font-heading">{t.replace(/_/g, " ")}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="font-heading gap-2 bg-transparent w-full"
                    onClick={() => setActiveAgent(null)}
                  >
                    <X className="h-4 w-4" /> Detach Agent
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Agent picker dialog */}
      <AgentPickerDialog
        open={showAgentPicker}
        onClose={() => setShowAgentPicker(false)}
        installedAgents={installedAgents}
        activeAgent={activeAgent}
        onSelect={setActiveAgent}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Task runner — ReAct-style loop via /api/chat + optional knowledge search
   ═══════════════════════════════════════════════════════ */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Play, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { TaskJobDto, TaskStepDto } from "@shared/studio-api";
import {
  fetchKnowledgeCollections,
  fetchTaskJob,
  fetchTaskSummaries,
  startTask,
} from "@/lib/studio-client";
import type { KnowledgeCollectionDto } from "@shared/studio-api";
import { apiKeyForProvider, providerForUiModel } from "@shared/chat-api";
import { loadStoredApiKeys } from "@/lib/api-keys";

const MODELS = [
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "deepseek-r1", name: "DeepSeek R1" },
  { id: "moonshot-128k", name: "Kimi 128K" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B (Ollama)" },
];

interface RunSummary {
  id: string;
  task: string;
  status: TaskJobDto["status"];
  at: string;
}

function stepLabel(t: TaskStepDto["type"]): string {
  switch (t) {
    case "model":
      return "Model";
    case "thought":
      return "Thought";
    case "tool":
      return "Tool";
    case "observation":
      return "Observation";
    case "error":
      return "Error";
    default:
      return t;
  }
}

export default function TaskRunnerPage() {
  const [task, setTask] = useState("");
  const [model, setModel] = useState("gpt-4.1");
  const [collections, setCollections] = useState<KnowledgeCollectionDto[]>([]);
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<TaskJobDto | null>(null);
  const [history, setHistory] = useState<RunSummary[]>([]);

  const keys = loadStoredApiKeys();
  const provider = providerForUiModel(model);
  const keyReady = provider === "ollama" || !!apiKeyForProvider(keys, provider);

  const loadCollections = useCallback(async () => {
    try {
      const list = await fetchKnowledgeCollections();
      setCollections(list);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const refreshHistory = useCallback(() => {
    void fetchTaskSummaries(35).then((list) => {
      setHistory(
        list.map((x) => ({
          id: x.id,
          task: (x.task || x.id).slice(0, 80),
          status: x.status,
          at: x.createdAt,
        })),
      );
    });
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let iv: ReturnType<typeof setInterval> | undefined;
    const tick = async () => {
      try {
        const j = await fetchTaskJob(jobId);
        if (cancelled) return;
        setJob(j);
        if (j.status === "done" || j.status === "error") {
          if (iv) clearInterval(iv);
          refreshHistory();
        }
      } catch (e) {
        if (!cancelled) toast.error(String(e));
      }
    };
    void tick();
    iv = setInterval(tick, 900);
    return () => {
      cancelled = true;
      if (iv) clearInterval(iv);
    };
  }, [jobId, refreshHistory]);

  const runTask = async () => {
    if (!task.trim()) {
      toast.error("Enter a task first");
      return;
    }
    if (!keyReady) {
      toast.error("Add the API key for this model in Settings (or use Ollama).");
      return;
    }
    setJob(null);
    try {
      const id = await startTask({
        task: task.trim(),
        model,
        knowledgeCollectionId: knowledgeId || undefined,
      });
      setJobId(id);
      toast.success("Task started — polling trace…");
    } catch (e) {
      toast.error(String(e));
    }
  };

  const loadPast = async (id: string) => {
    try {
      const j = await fetchTaskJob(id);
      setJob(j);
      setJobId(id);
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">Task Runner</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 text-muted-foreground">
                ReAct + chat API
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-step agent using your studio model; optional knowledge search uses OpenAI embeddings on the server.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-6 py-4 border-b border-border/40 shrink-0 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <Input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe what you want the agent to figure out or produce…"
                className="flex-1 min-w-[200px] h-10 text-sm bg-muted/20 border-border/40"
                onKeyDown={(e) => e.key === "Enter" && runTask()}
              />
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-48 h-10 text-xs bg-muted/20 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={knowledgeId || "__none__"} onValueChange={(v) => setKnowledgeId(v === "__none__" ? "" : v)}>
                <SelectTrigger className="w-52 h-10 text-xs bg-muted/20 border-border/40">
                  <SelectValue placeholder="Knowledge (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No knowledge base</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.chunkCount} chunks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="h-10 px-5 gap-2 text-sm font-semibold" onClick={runTask} disabled={!task.trim()}>
                <Play className="h-4 w-4" />
                Run task
              </Button>
            </div>
            {!keyReady && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Configure API keys in Settings for this model.</p>
            )}
          </div>

          <ScrollArea className="flex-1 px-6 py-6">
            {!job && !jobId && (
              <div className="max-w-lg mx-auto text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Each run enqueues a job on the server. The agent alternates between model turns and optional{" "}
                  <code className="text-xs bg-muted/50 px-1 rounded">search_knowledge</code> when a collection is selected.
                </p>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-heading font-semibold text-primary">OpenManus</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    For heavier tool use (browsers, shells, swarms), plug in{" "}
                    <a
                      href="https://github.com/FoundationAgents/OpenManus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      OpenManus <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    or your own worker; this runner stays inside the chat API you already have.
                  </p>
                </div>
              </div>
            )}

            {job && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === "done" ? "default" : job.status === "error" ? "destructive" : "secondary"}>
                    {job.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{job.id}</span>
                </div>
                {job.result && job.status === "done" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm whitespace-pre-wrap">
                    {job.result}
                  </div>
                )}
                {job.error && job.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {job.error}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                    Trace
                  </h3>
                  <ul className="space-y-2">
                    {job.trace.map((s, i) => (
                      <li
                        key={`${s.at}-${i}`}
                        className="rounded-lg border border-border/40 bg-card/30 p-3 text-xs font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto"
                      >
                        <span className="text-primary font-heading font-semibold mr-2">{stepLabel(s.type)}</span>
                        {s.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="w-72 border-l border-border/40 flex flex-col shrink-0 p-4 min-h-0">
          <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recent runs (server)
          </h3>
          <ScrollArea className="flex-1">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">Finished jobs appear here for quick recall.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => void loadPast(h.id)}
                      className="w-full text-left rounded-lg border border-border/30 px-2 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="text-[11px] font-medium line-clamp-2">{h.task}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex justify-between gap-2">
                        <span>{h.status}</span>
                        <span className="font-mono truncate">{h.id.slice(0, 8)}…</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

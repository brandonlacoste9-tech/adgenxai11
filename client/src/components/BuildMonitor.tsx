import { useCallback, useEffect, useRef, useState } from "react";
import { BUILD_SSE_EVENT_TYPES } from "@shared/build-api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileCode, Loader2, MonitorPlay } from "lucide-react";

type LintState = { ok: boolean; skipped?: boolean } | null;
type TestState = { passed: number; failed: number } | null;

function appendLine(ref: React.MutableRefObject<string>, line: string, max = 12000) {
  const next = ref.current ? `${ref.current}\n${line}` : line;
  ref.current = next.length > max ? next.slice(-max) : next;
}

export default function BuildMonitor({ buildId }: { buildId: string }) {
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lint, setLint] = useState<LintState>(null);
  const [tests, setTests] = useState<TestState>(null);
  const [done, setDone] = useState(false);
  const logRef = useRef("");
  const [, bumpLog] = useState(0);
  const flushLog = useCallback(() => bumpLog((n) => n + 1), []);

  const loadFullFile = useCallback(
    async (p: string) => {
      const res = await fetch(`/api/build/${encodeURIComponent(buildId)}/file?path=${encodeURIComponent(p)}`);
      if (!res.ok) return;
      const text = await res.text();
      setFiles((prev) => ({ ...prev, [p]: text }));
      setSelected(p);
    },
    [buildId],
  );

  useEffect(() => {
    logRef.current = "";
    flushLog();
    const es = new EventSource(`/api/build/${encodeURIComponent(buildId)}/events`);

    const onEvent = (type: string) => (ev: MessageEvent) => {
      let payload: unknown;
      try {
        payload = JSON.parse(ev.data);
      } catch {
        return;
      }

      switch (type) {
        case "build_progress": {
          const p = payload as { percent?: number; label?: string };
          if (typeof p.percent === "number") setProgress(Math.min(100, Math.max(0, p.percent)));
          setProgressLabel(p.label ?? null);
          if (p.label) {
            appendLine(logRef, `[progress] ${p.percent ?? "?"}% — ${p.label}`);
            flushLog();
          }
          break;
        }
        case "llm_token":
          // Tokens are not echoed line-by-line (would flood React updates); progress + files carry UX.
          break;
        case "file_written": {
          const f = payload as { path?: string; snippet?: string };
          if (f.path && typeof f.snippet === "string") {
            setFiles((prev) => ({ ...prev, [f.path!]: f.snippet! }));
            appendLine(logRef, `file_written: ${f.path}`);
            flushLog();
            if (!selected) setSelected(f.path);
          }
          break;
        }
        case "lint_result": {
          const l = payload as { ok?: boolean; errors?: string[]; skipped?: boolean };
          setLint({ ok: !!l.ok, skipped: l.skipped });
          appendLine(logRef, `lint: ${l.ok ? "ok" : "fail"}${l.skipped ? " (skipped)" : ""}`);
          if (l.errors?.length) l.errors.forEach((e) => appendLine(logRef, `  ${e}`));
          flushLog();
          break;
        }
        case "test_result": {
          const te = payload as { passed?: number; failed?: number; details?: string };
          setTests({ passed: te.passed ?? 0, failed: te.failed ?? 0 });
          appendLine(
            logRef,
            `tests: ${te.passed ?? 0} passed, ${te.failed ?? 0} failed${te.details ? `\n${te.details.slice(0, 2000)}` : ""}`,
          );
          flushLog();
          break;
        }
        case "preview_ready": {
          const pr = payload as { url?: string | null; reason?: string };
          if (pr.url) {
            const abs = pr.url.startsWith("http") ? pr.url : `${window.location.origin}${pr.url}`;
            setPreviewUrl(abs);
            setPreviewNote(null);
            appendLine(logRef, `preview_ready: ${abs}`);
          } else {
            setPreviewUrl(null);
            setPreviewNote(pr.reason ?? "No preview URL");
            appendLine(logRef, `preview_ready: ${pr.reason ?? "none"}`);
          }
          flushLog();
          break;
        }
        case "build_done": {
          const d = payload as { ok?: boolean };
          setDone(true);
          appendLine(logRef, `build_done: ${d.ok ? "ok" : "failed"}`);
          flushLog();
          es.close();
          break;
        }
        case "error": {
          const err = payload as { message?: string };
          const msg = err.message ?? "Unknown error";
          setError(msg);
          appendLine(logRef, `error: ${msg}`);
          flushLog();
          break;
        }
        default:
          break;
      }
    };

    for (const t of BUILD_SSE_EVENT_TYPES) {
      es.addEventListener(t, onEvent(t) as EventListener);
    }

    es.onerror = () => {
      appendLine(logRef, "[sse] connection error (stream may have ended)");
      flushLog();
      es.close();
    };

    return () => {
      es.close();
    };
  }, [buildId, flushLog]);

  const filePaths = Object.keys(files).sort();

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] gap-3 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MonitorPlay className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="font-heading font-semibold text-sm sm:text-base truncate">Build monitor</h1>
            <p className="text-[11px] text-muted-foreground font-mono truncate">id: {buildId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lint && (
            <Badge variant={lint.ok ? "default" : "destructive"} className="text-[10px]">
              Lint {lint.skipped ? "(skip)" : lint.ok ? "OK" : "FAIL"}
            </Badge>
          )}
          {tests && (
            <Badge variant={tests.failed ? "destructive" : "secondary"} className="text-[10px]">
              Tests {tests.passed}/{tests.passed + tests.failed}
            </Badge>
          )}
          {done && <Badge className="text-[10px]">Finished</Badge>}
        </div>
      </div>

      <div className="space-y-1 shrink-0">
        <div className="flex justify-between text-[11px] text-muted-foreground font-heading">
          <span>{progressLabel ?? "Waiting…"}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-[200px] border border-border/40 rounded-xl bg-card/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/40 text-xs font-heading text-muted-foreground">Files</div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {filePaths.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-4">No files yet…</p>
              ) : (
                filePaths.map((p) => (
                  <Button
                    key={p}
                    variant={selected === p ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-8 text-xs font-mono px-2"
                    onClick={() => void loadFullFile(p)}
                  >
                    <FileCode className="h-3.5 w-3.5 mr-1.5 shrink-0 opacity-70" />
                    <span className="truncate">{p}</span>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-border/40 p-2 max-h-[140px]">
            <p className="text-[10px] font-heading text-muted-foreground mb-1">Console</p>
            <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all max-h-[100px] overflow-y-auto bg-background/50 rounded p-2">
              {logRef.current || "—"}
            </pre>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col min-h-[240px] border border-border/40 rounded-xl bg-card/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/40 text-xs font-heading text-muted-foreground">Source</div>
          <ScrollArea className="flex-1">
            {selected ? (
              <pre className="p-3 text-xs font-mono text-foreground/90 whitespace-pre-wrap break-all">
                {files[selected] ?? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                  </span>
                )}
              </pre>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">Select a file to load full contents.</p>
            )}
          </ScrollArea>
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-[240px] border border-border/40 rounded-xl bg-card/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/40 text-xs font-heading text-muted-foreground">Preview</div>
          <div className="flex-1 min-h-[200px] bg-background/40">
            {previewUrl ? (
              <iframe title="Build preview" src={previewUrl} className="w-full h-full min-h-[220px] border-0 bg-white" />
            ) : (
              <div className="p-4 text-sm text-muted-foreground h-full flex items-center justify-center text-center">
                {previewNote ?? "Preview appears here for site (HTML) builds."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

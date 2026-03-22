/* ═══════════════════════════════════════════════════════
   NullClaw — AdGenXAI Amber Atelier
   Ultra-lightweight edge agent runtime.
   678KB Zig binary, 1MB RAM, 2ms boot, SQLite memory.
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Zap, Cpu, MemoryStick, Timer, Code2, Play, Terminal,
  Database, Wifi, WifiOff, Globe, Server, Package,
  CheckCircle2, Activity, Binary, Layers, Download,
  ChevronRight, Sparkles, Bot, ArrowRight,
} from "lucide-react";

/* ─── Mock edge nodes ─────────────────────────────────── */
const EDGE_NODES = [
  { id: "null-edge-01", location: "Montréal, QC", latency: 2, status: "online", load: 8, binary: "678 KB", ram: "0.9 MB" },
  { id: "null-edge-02", location: "Toronto, ON", latency: 4, status: "online", load: 23, binary: "678 KB", ram: "1.1 MB" },
  { id: "null-edge-03", location: "New York, NY", latency: 7, status: "online", load: 41, binary: "678 KB", ram: "1.4 MB" },
  { id: "null-edge-04", location: "San Francisco, CA", latency: 18, status: "online", load: 15, binary: "678 KB", ram: "0.8 MB" },
  { id: "null-edge-05", location: "London, UK", latency: 62, status: "degraded", load: 0, binary: "678 KB", ram: "0 MB" },
  { id: "null-edge-06", location: "Paris, FR", latency: 68, status: "online", load: 5, binary: "678 KB", ram: "0.7 MB" },
];

const WASM_TASKS = [
  { id: "wt-001", name: "JSON transformer", runtime: "1.2ms", memory: "0.4 MB", status: "complete" },
  { id: "wt-002", name: "Text classifier", runtime: "3.8ms", memory: "0.9 MB", status: "complete" },
  { id: "wt-003", name: "Regex extractor", runtime: "0.6ms", memory: "0.2 MB", status: "running" },
  { id: "wt-004", name: "Embedding lookup", runtime: "2.1ms", memory: "0.7 MB", status: "complete" },
  { id: "wt-005", name: "Schema validator", runtime: "0.9ms", memory: "0.3 MB", status: "queued" },
];

const BOOT_SEQUENCE = [
  "nullclaw v0.9.1 (zig 0.14.0)",
  "binary: 678,432 bytes",
  "allocator: fixed_buffer (1MB)",
  "sqlite: memory mode — init 0.1ms",
  "llm: vertex-ai/gemini-flash-lite",
  "tools: [bash, file_read, http_get, sqlite_query]",
  "boot complete — 1.9ms",
  "agent ready ▋",
];

export default function NullClawPage() {
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [booting, setBooting] = useState(false);
  const [booted, setBooted] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [taskOutput, setTaskOutput] = useState("");
  const [running, setRunning] = useState(false);

  const runBoot = () => {
    setBooting(true);
    setBooted(false);
    setBootLines([]);
    BOOT_SEQUENCE.forEach((line, i) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (i === BOOT_SEQUENCE.length - 1) {
          setBooting(false);
          setBooted(true);
          toast.success("NullClaw booted in 1.9ms");
        }
      }, i * 120);
    });
  };

  const runTask = () => {
    if (!taskInput.trim()) return;
    setRunning(true);
    setTaskOutput("");
    const responses = [
      `[nullclaw] task: "${taskInput}"\n[0.2ms] parsing intent...\n[0.4ms] selecting tool: bash\n[0.8ms] executing...\n[1.1ms] result: Task completed successfully.\n\nOutput:\n${taskInput.length > 20 ? taskInput.slice(0, 20) + "..." : taskInput} → processed in 1.1ms using 0.6MB RAM.\n\n[nullclaw] done — total: 1.1ms`,
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < responses[0].length) {
        setTaskOutput(prev => prev + responses[0][i]);
        i++;
      } else {
        clearInterval(interval);
        setRunning(false);
      }
    }, 12);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Binary className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">NullClaw</h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-violet-500/10 text-violet-400 border-violet-500/20">
                Edge Runtime
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                678 KB
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Zig-compiled single binary — 1MB RAM, 2ms boot, runs anywhere</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info("Downloading NullClaw binary...")}>
            <Download className="h-3.5 w-3.5" />
            Download Binary
          </Button>
          <Button size="sm" className="gap-2 text-xs bg-violet-600 hover:bg-violet-500 text-white" onClick={runBoot}>
            <Zap className="h-3.5 w-3.5" />
            Boot NullClaw
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-px bg-border/20 border-b border-border/40 shrink-0">
        {[
          { label: "Binary Size", value: "678 KB", icon: Package, color: "text-violet-400" },
          { label: "Boot Time", value: "< 2ms", icon: Timer, color: "text-emerald-400" },
          { label: "RAM Usage", value: "~1 MB", icon: MemoryStick, color: "text-blue-400" },
          { label: "Edge Nodes", value: `${EDGE_NODES.filter(n => n.status === "online").length}/6`, icon: Globe, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 px-5 py-3 bg-background">
            <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="terminal" className="h-full flex flex-col">
          <div className="px-6 pt-4 shrink-0">
            <TabsList className="bg-muted/30 h-9">
              <TabsTrigger value="terminal" className="text-xs gap-1.5"><Terminal className="h-3.5 w-3.5" />Terminal</TabsTrigger>
              <TabsTrigger value="edge" className="text-xs gap-1.5"><Globe className="h-3.5 w-3.5" />Edge Nodes</TabsTrigger>
              <TabsTrigger value="wasm" className="text-xs gap-1.5"><Code2 className="h-3.5 w-3.5" />WASM Tasks</TabsTrigger>
              <TabsTrigger value="memory" className="text-xs gap-1.5"><Database className="h-3.5 w-3.5" />SQLite Memory</TabsTrigger>
            </TabsList>
          </div>

          {/* Terminal tab */}
          <TabsContent value="terminal" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <div className="h-full flex flex-col gap-3">
              {/* Boot terminal */}
              <div className="flex-1 bg-black/70 rounded-xl border border-border/30 overflow-hidden font-mono text-xs">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 bg-black/40">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-muted-foreground/60 ml-2">nullclaw — edge terminal</span>
                </div>
                <ScrollArea className="h-[calc(100%-40px)] p-4">
                  {bootLines.length === 0 && !booting && (
                    <p className="text-muted-foreground/40">Click "Boot NullClaw" to start the runtime...</p>
                  )}
                  {bootLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mb-0.5 ${line.includes("boot complete") || line.includes("agent ready") ? "text-emerald-400" : line.includes("binary:") || line.includes("allocator:") ? "text-violet-400" : "text-foreground/80"}`}
                    >
                      {line.includes("agent ready") ? (
                        <span className="flex items-center gap-2">
                          {line} <span className="animate-pulse">|</span>
                        </span>
                      ) : line}
                    </motion.div>
                  ))}
                  {booted && taskOutput && (
                    <div className="mt-4 text-foreground/80 whitespace-pre-wrap">{taskOutput}</div>
                  )}
                  {running && (
                    <div className="mt-1 text-foreground/80 whitespace-pre-wrap">{taskOutput}<span className="animate-pulse">▋</span></div>
                  )}
                </ScrollArea>
              </div>
              {/* Task input */}
              {booted && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <Input
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    placeholder="Enter a task for NullClaw..."
                    className="font-mono text-xs bg-black/40 border-border/40"
                    onKeyDown={e => e.key === "Enter" && runTask()}
                  />
                  <Button size="sm" className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white shrink-0" onClick={runTask} disabled={running}>
                    <Play className="h-3.5 w-3.5" />
                    Run
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* Edge Nodes tab */}
          <TabsContent value="edge" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {EDGE_NODES.map((node, i) => (
                  <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 border border-border/40 bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${node.status === "online" ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                          {node.status === "online" ? <Wifi className="h-4.5 w-4.5 text-emerald-400" /> : <WifiOff className="h-4.5 w-4.5 text-amber-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-heading font-semibold text-sm">{node.location}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${node.status === "online" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                              {node.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-mono">{node.id}</span>
                            <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{node.latency}ms</span>
                            <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{node.load}% load</span>
                            <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />{node.ram}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs h-8 gap-1.5" onClick={() => toast.success(`Deploying to ${node.location}...`)}>
                          <ArrowRight className="h-3.5 w-3.5" />
                          Deploy
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* WASM Tasks tab */}
          <TabsContent value="wasm" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">NullClaw compiles agent tools to WebAssembly for client-side execution — zero server round-trips, maximum privacy.</p>
              </div>
              <div className="space-y-3">
                {WASM_TASKS.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="p-4 border border-border/40 bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                          <Code2 className="h-4.5 w-4.5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-heading font-semibold text-sm">{task.name}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${task.status === "complete" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : task.status === "running" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-muted/50 text-muted-foreground border-border/40"}`}>
                              {task.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-mono">{task.id}</span>
                            <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{task.runtime}</span>
                            <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />{task.memory}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs h-8 gap-1.5" onClick={() => toast.info(`Re-running ${task.name}...`)}>
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* SQLite Memory tab */}
          <TabsContent value="memory" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="mb-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="h-5 w-5 text-violet-400" />
                  <span className="font-heading font-semibold text-sm">Local SQLite Memory</span>
                </div>
                <p className="text-xs text-muted-foreground">NullClaw uses SQLite in memory mode for zero-latency, zero-network agent memory. All data stays on-device — never leaves the edge node.</p>
              </div>
              <div className="space-y-3">
                {[
                  { table: "agent_memory", rows: 847, size: "124 KB", desc: "Conversation history and context windows" },
                  { table: "tool_results", rows: 2341, size: "891 KB", desc: "Cached tool call outputs for deduplication" },
                  { table: "embeddings", rows: 156, size: "48 KB", desc: "Local vector embeddings for semantic search" },
                  { table: "task_queue", rows: 3, size: "2 KB", desc: "Pending tasks awaiting execution" },
                ].map((tbl) => (
                  <Card key={tbl.table} className="p-4 border border-border/40 bg-card/50">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Database className="h-4.5 w-4.5 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono font-semibold text-sm text-violet-400">{tbl.table}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{tbl.rows.toLocaleString()} rows</span>
                          <span>{tbl.size}</span>
                          <span>{tbl.desc}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs h-8 gap-1.5" onClick={() => toast.info(`Querying ${tbl.table}...`)}>
                        <Code2 className="h-3.5 w-3.5" />
                        Query
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

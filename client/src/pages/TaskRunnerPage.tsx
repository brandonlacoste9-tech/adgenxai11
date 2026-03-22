/* ═══════════════════════════════════════════════════════
   Task Runner — AdGenXAI Amber Atelier
   Powered by OpenManus. One-button autonomous task execution.
   Live ReAct loop: Plan → Think → Tool call → Observe → Result
   ═══════════════════════════════════════════════════════ */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Play, Square, Sparkles, Bot, Terminal, Globe, Code2,
  FileText, Search, CheckCircle2, AlertCircle, Clock,
  ChevronRight, Zap, Cpu, RotateCcw, Share2, Download,
  Brain, Wrench, Eye, ArrowRight, Layers, Activity,
  MessageSquare, ExternalLink, Copy,
} from "lucide-react";

/* ─── Task step types ─────────────────────────────────── */
type StepType = "plan" | "think" | "tool" | "observe" | "result" | "error";
interface TaskStep {
  id: string;
  type: StepType;
  title: string;
  content: string;
  tool?: string;
  duration?: string;
  status: "running" | "complete" | "error";
}

/* ─── Task templates ──────────────────────────────────── */
const TASK_TEMPLATES = [
  { label: "Research top AI agent frameworks 2026", icon: Search },
  { label: "Build a React landing page for a SaaS product", icon: Code2 },
  { label: "Analyze this CSV and create a summary report", icon: FileText },
  { label: "Find and summarize the latest news on Vertex AI", icon: Globe },
  { label: "Write a Python script to scrape product prices", icon: Terminal },
  { label: "Create a marketing email for a product launch", icon: MessageSquare },
];

/* ─── Simulated ReAct execution sequences ─────────────── */
const generateSteps = (task: string, runtime: string): TaskStep[] => {
  const isCode = task.toLowerCase().includes("build") || task.toLowerCase().includes("script") || task.toLowerCase().includes("react");
  const isResearch = task.toLowerCase().includes("research") || task.toLowerCase().includes("find") || task.toLowerCase().includes("news") || task.toLowerCase().includes("analyze");
  const isWrite = task.toLowerCase().includes("write") || task.toLowerCase().includes("email") || task.toLowerCase().includes("report");

  const base: TaskStep[] = [
    {
      id: "s1", type: "plan", title: "Planning", status: "complete", duration: "0.3s",
      content: `Breaking down task: "${task}"\n\nSubtasks identified:\n1. Understand the goal and constraints\n2. Select appropriate tools\n3. Execute step by step\n4. Validate output\n5. Return final result`,
    },
    {
      id: "s2", type: "think", title: "Reasoning", status: "complete", duration: "0.8s",
      content: `Analyzing task requirements...\n\nApproach: ${isCode ? "Code generation with iterative refinement" : isResearch ? "Multi-source research with synthesis" : "Structured writing with context"}\nRuntime: ${runtime}\nTools available: browser_use, python_execute, bash, file_operators, crawl4ai\nSelected tools: ${isCode ? "python_execute, bash" : isResearch ? "browser_use, crawl4ai" : "create_chat_completion, file_operators"}`,
    },
  ];

  if (isResearch) {
    base.push(
      { id: "s3", type: "tool", title: "Tool Call", tool: "browser_use", status: "complete", duration: "2.1s", content: `browser_use.navigate("https://google.com/search?q=${encodeURIComponent(task)}")\n→ Page loaded: 847ms\n→ Extracted: 12 results` },
      { id: "s4", type: "observe", title: "Observation", status: "complete", duration: "0.4s", content: "Found 12 relevant results. Top 3 sources identified:\n1. TechCrunch — 'AI Agent Frameworks Comparison 2026'\n2. GitHub Trending — OpenManus, AutoGen, CrewAI\n3. Arxiv — 'Survey of Agentic AI Systems'" },
      { id: "s5", type: "tool", title: "Tool Call", tool: "crawl4ai", status: "complete", duration: "3.4s", content: `crawl4ai.extract("https://techcrunch.com/ai-agents-2026")\n→ Crawled: 4,231 tokens\n→ Relevant sections: 3` },
      { id: "s6", type: "observe", title: "Observation", status: "complete", duration: "0.2s", content: "Extracted key data:\n• OpenManus: 47k GitHub stars, Python, ReAct architecture\n• NanoClaw: Docker-isolated, Agent Swarms, security-first\n• NullClaw: 678KB Zig binary, 2ms boot, edge-native" },
    );
  } else if (isCode) {
    base.push(
      { id: "s3", type: "tool", title: "Tool Call", tool: "python_execute", status: "complete", duration: "1.2s", content: `python_execute("""\n# Scaffolding ${task}\nimport subprocess\nsubprocess.run(['npx', 'create-react-app', 'my-app', '--template', 'typescript'])\n""")\n→ Exit code: 0\n→ Output: 2,341 bytes` },
      { id: "s4", type: "observe", title: "Observation", status: "complete", duration: "0.3s", content: "React app scaffolded successfully. Now generating component code..." },
      { id: "s5", type: "tool", title: "Tool Call", tool: "bash", status: "complete", duration: "0.9s", content: `bash("cat > src/App.tsx << 'EOF'\n// Generated by OpenManus\nimport React from 'react';\n// ... component code\nEOF")\n→ File written: 1,247 bytes` },
      { id: "s6", type: "observe", title: "Observation", status: "complete", duration: "0.2s", content: "Code written. Running build validation..." },
    );
  } else {
    base.push(
      { id: "s3", type: "tool", title: "Tool Call", tool: "create_chat_completion", status: "complete", duration: "2.8s", content: `create_chat_completion(\n  model="${runtime === "NullClaw" ? "gemini-flash-lite" : "claude-3-5-sonnet"}",\n  system="You are an expert writer...",\n  user="${task}"\n)\n→ Tokens: 847 in, 1,203 out` },
      { id: "s4", type: "observe", title: "Observation", status: "complete", duration: "0.1s", content: "Draft generated. Reviewing for quality and accuracy..." },
      { id: "s5", type: "tool", title: "Tool Call", tool: "file_operators", status: "complete", duration: "0.3s", content: `file_operators.write("output.md", content)\n→ Written: 2,847 bytes\n→ Path: /workspace/output.md` },
    );
  }

  base.push({
    id: "s-final", type: "result", title: "Task Complete", status: "complete", duration: "0.1s",
    content: `✓ Task completed successfully\n\nSummary: "${task.slice(0, 60)}${task.length > 60 ? "..." : ""}"\n\nSteps executed: ${base.length + 1}\nTotal time: ${(Math.random() * 8 + 3).toFixed(1)}s\nTokens used: ${Math.floor(Math.random() * 3000 + 1000).toLocaleString()}\nCredits consumed: ${Math.floor(Math.random() * 5 + 1)}\n\nOutput ready for download.`,
  });

  return base;
};

const RECENT_TASKS = [
  { task: "Research AI agent frameworks 2026", runtime: "OpenClaw", status: "complete", time: "2m ago", credits: 3 },
  { task: "Build landing page for SaaS product", runtime: "NanoClaw", status: "complete", time: "15m ago", credits: 5 },
  { task: "Summarize latest Vertex AI announcements", runtime: "NullClaw", status: "complete", time: "1h ago", credits: 2 },
  { task: "Write marketing email for product launch", runtime: "OpenClaw", status: "complete", time: "3h ago", credits: 2 },
];

const stepIcon: Record<StepType, React.ComponentType<{ className?: string }>> = {
  plan: Layers,
  think: Brain,
  tool: Wrench,
  observe: Eye,
  result: CheckCircle2,
  error: AlertCircle,
};
const stepColor: Record<StepType, string> = {
  plan: "text-blue-400 bg-blue-400/10",
  think: "text-violet-400 bg-violet-400/10",
  tool: "text-amber-400 bg-amber-400/10",
  observe: "text-emerald-400 bg-emerald-400/10",
  result: "text-primary bg-primary/10",
  error: "text-red-400 bg-red-400/10",
};

export default function TaskRunnerPage() {
  const [task, setTask] = useState("");
  const [runtime, setRuntime] = useState("OpenClaw");
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const runTask = () => {
    if (!task.trim()) {
      toast.error("Enter a task first");
      return;
    }
    const generated = generateSteps(task, runtime);
    setSteps(generated);
    setVisibleSteps(0);
    setRunning(true);
    setDone(false);

    generated.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSteps(i + 1);
        if (i === generated.length - 1) {
          setRunning(false);
          setDone(true);
          toast.success("Task completed!");
        }
      }, i * 900 + 400);
    });
  };

  const reset = () => {
    setSteps([]);
    setVisibleSteps(0);
    setRunning(false);
    setDone(false);
    setTask("");
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">Task Runner</h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-primary/10 text-primary border-primary/20">
                Powered by OpenManus
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">One-button autonomous execution — ReAct loop with live trace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {done && (
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info("Sharing task run...")}>
              <Share2 className="h-3.5 w-3.5" />
              Share Run
            </Button>
          )}
          {(running || done) && (
            <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Task input + execution trace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Task input */}
          <div className="px-6 py-4 border-b border-border/40 shrink-0">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  placeholder="Describe what you want the agent to do..."
                  className="h-10 text-sm bg-muted/20 border-border/40"
                  onKeyDown={e => e.key === "Enter" && !running && runTask()}
                  disabled={running}
                />
              </div>
              <Select value={runtime} onValueChange={setRuntime} disabled={running}>
                <SelectTrigger className="w-36 h-10 text-xs bg-muted/20 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenClaw">OpenClaw</SelectItem>
                  <SelectItem value="NanoClaw">NanoClaw</SelectItem>
                  <SelectItem value="NullClaw">NullClaw</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="h-10 px-5 gap-2 text-sm font-semibold"
                onClick={running ? undefined : runTask}
                disabled={running || !task.trim()}
              >
                {running ? (
                  <><Activity className="h-4 w-4 animate-pulse" />Running...</>
                ) : (
                  <><Play className="h-4 w-4" />Run Task</>
                )}
              </Button>
            </div>
            {/* Quick templates */}
            {!running && !done && (
              <div className="flex flex-wrap gap-2 mt-3">
                {TASK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    onClick={() => setTask(tmpl.label)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/30"
                  >
                    <tmpl.icon className="h-3 w-3" />
                    {tmpl.label.slice(0, 35)}{tmpl.label.length > 35 ? "..." : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Execution trace */}
          <div className="flex-1 overflow-hidden px-6 py-4">
            {steps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">OpenManus Task Runner</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">Enter a task and hit Run. The agent will autonomously plan, use tools, observe results, and deliver the output — all streamed live.</p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  {[
                    { icon: Brain, label: "ReAct Loop" },
                    { icon: Wrench, label: "Tool Use" },
                    { icon: Eye, label: "Live Trace" },
                    { icon: CheckCircle2, label: "Verified Output" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="space-y-3 pb-4">
                  {/* Runtime badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs gap-1.5 bg-primary/10 text-primary border-primary/20">
                      <Bot className="h-3 w-3" />{runtime} Runtime
                    </Badge>
                    {running && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3 animate-pulse text-primary" />
                        Executing...
                      </div>
                    )}
                    {done && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                      </div>
                    )}
                  </div>

                  {steps.slice(0, visibleSteps).map((step, i) => {
                    const Icon = stepIcon[step.type];
                    const colorClass = stepColor[step.type];
                    const isLast = i === visibleSteps - 1 && running;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex gap-3">
                          {/* Step icon + connector */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {i < visibleSteps - 1 && (
                              <div className="w-px flex-1 bg-border/40 mt-1 mb-1 min-h-[8px]" />
                            )}
                          </div>
                          {/* Step content */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-heading font-semibold text-sm">{step.title}</span>
                              {step.tool && (
                                <Badge variant="outline" className="text-[10px] px-1.5 bg-amber-400/10 text-amber-400 border-amber-400/20 font-mono">
                                  {step.tool}
                                </Badge>
                              )}
                              {step.duration && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />{step.duration}
                                </span>
                              )}
                              {isLast && (
                                <span className="flex items-center gap-1 text-[10px] text-primary animate-pulse">
                                  <Activity className="h-2.5 w-2.5" />running
                                </span>
                              )}
                            </div>
                            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                              <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                                {step.content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Running indicator */}
                  {running && visibleSteps < steps.length && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
                      </div>
                      <span className="text-xs text-muted-foreground animate-pulse">Processing next step...</span>
                    </motion.div>
                  )}

                  {/* Done — action buttons */}
                  {done && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => toast.info("Downloading output...")}>
                        <Download className="h-3.5 w-3.5" />
                        Download Output
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => toast.info("Copying to clipboard...")}>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => toast.info("Sharing run link...")}>
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Right: Recent tasks sidebar */}
        <div className="w-72 border-l border-border/40 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border/40">
            <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Recent Runs</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {RECENT_TASKS.map((rt, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/30 hover:border-border/60 transition-colors group"
                  onClick={() => setTask(rt.task)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{rt.task}</p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{rt.runtime}</span>
                    <span>{rt.credits} credits</span>
                    <span>{rt.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          {/* OpenManus attribution */}
          <div className="p-4 border-t border-border/40">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-heading font-semibold text-primary">Powered by OpenManus</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Open-source general AI agent framework. ReAct loop with browser use, code execution, file ops, and MCP tool support.</p>
              <a
                href="https://github.com/FoundationAgents/OpenManus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-2"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="h-2.5 w-2.5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NanoClaw — AdGenXAI Amber Atelier
   Secure containerized agent runtime.
   Docker-isolated workers, Agent Swarms, zero trust execution.
   ═══════════════════════════════════════════════════════ */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Shield, Container, Zap, GitBranch, Play, Plus, Settings2,
  Terminal, Activity, CheckCircle2, AlertCircle, Clock,
  Cpu, MemoryStick, Network, Lock, Layers, Bot, RefreshCw,
  ChevronRight, ExternalLink, Boxes, FlaskConical, Workflow,
} from "lucide-react";

/* ─── Mock container data ─────────────────────────────── */
const SWARM_AGENTS = [
  { id: "nc-001", name: "Web Researcher", status: "running", cpu: 12, mem: 128, tasks: 3, model: "Claude 3.5", color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  { id: "nc-002", name: "Code Executor", status: "running", cpu: 34, mem: 256, tasks: 1, model: "GPT-4.1", color: "text-blue-400", bgColor: "bg-blue-400/10" },
  { id: "nc-003", name: "Data Analyst", status: "idle", cpu: 0, mem: 64, tasks: 0, model: "DeepSeek R1", color: "text-violet-400", bgColor: "bg-violet-400/10" },
  { id: "nc-004", name: "File Manager", status: "idle", cpu: 0, mem: 48, tasks: 0, model: "GPT-4.1", color: "text-amber-400", bgColor: "bg-amber-400/10" },
  { id: "nc-005", name: "Browser Agent", status: "stopped", cpu: 0, mem: 0, tasks: 0, model: "Claude 3.5", color: "text-red-400", bgColor: "bg-red-400/10" },
];

const CONTAINER_LOGS = [
  { time: "11:42:01", level: "INFO", msg: "Container nc-001 started — image: nanoclaw/web-researcher:latest" },
  { time: "11:42:01", level: "INFO", msg: "Isolation layer active — network: bridge, filesystem: overlay2" },
  { time: "11:42:02", level: "INFO", msg: "Agent initialized — model: claude-3-5-sonnet, tools: [browser_use, crawl4ai]" },
  { time: "11:42:03", level: "INFO", msg: "Task received: 'Research top AI agent frameworks 2026'" },
  { time: "11:42:04", level: "TOOL", msg: "browser_use → navigate('https://github.com/trending?l=python')" },
  { time: "11:42:06", level: "TOOL", msg: "browser_use → extract_content() → 2,847 tokens" },
  { time: "11:42:07", level: "INFO", msg: "Container nc-002 started — image: nanoclaw/code-executor:latest" },
  { time: "11:42:07", level: "INFO", msg: "Sandbox: read-only filesystem, no network egress, 512MB RAM cap" },
  { time: "11:42:08", level: "TOOL", msg: "python_execute → running user code in isolated subprocess" },
  { time: "11:42:09", level: "INFO", msg: "Execution complete — exit code: 0, output: 847 bytes" },
  { time: "11:42:10", level: "WARN", msg: "Container nc-005 — health check failed, marking as stopped" },
  { time: "11:42:11", level: "INFO", msg: "Swarm coordinator: 2 active, 2 idle, 1 stopped" },
];

const SWARM_TEMPLATES = [
  { name: "Research Swarm", agents: 3, description: "Web researcher + data analyst + report writer", icon: FlaskConical, color: "text-blue-400" },
  { name: "Dev Swarm", agents: 4, description: "Code generator + tester + reviewer + deployer", icon: Workflow, color: "text-emerald-400" },
  { name: "Content Swarm", agents: 3, description: "Researcher + writer + SEO optimizer", icon: Layers, color: "text-violet-400" },
  { name: "Security Swarm", agents: 2, description: "Code auditor + vulnerability scanner", icon: Shield, color: "text-red-400" },
];

const statusColor: Record<string, string> = {
  running: "text-emerald-400",
  idle: "text-amber-400",
  stopped: "text-red-400",
};
const statusBg: Record<string, string> = {
  running: "bg-emerald-400/10 border-emerald-400/20",
  idle: "bg-amber-400/10 border-amber-400/20",
  stopped: "bg-red-400/10 border-red-400/20",
};

export default function NanoClawPage() {
  const [agents, setAgents] = useState(SWARM_AGENTS);
  const [activeLog, setActiveLog] = useState(true);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (a.status === "running") {
        toast.success(`Container ${id} stopped`);
        return { ...a, status: "stopped", cpu: 0, mem: 0 };
      } else {
        toast.success(`Container ${id} started`);
        return { ...a, status: "running", cpu: Math.floor(Math.random() * 30) + 5, mem: Math.floor(Math.random() * 200) + 64 };
      }
    }));
  };

  const runningCount = agents.filter(a => a.status === "running").length;
  const totalCpu = agents.reduce((s, a) => s + a.cpu, 0);
  const totalMem = agents.reduce((s, a) => s + a.mem, 0);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Container className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">NanoClaw</h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                Secure Runtime
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Docker-isolated agent containers with zero-trust execution</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info("Refreshing container status...")}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white" onClick={() => toast.success("New container launched!")}>
            <Plus className="h-3.5 w-3.5" />
            New Container
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-px bg-border/20 border-b border-border/40 shrink-0">
        {[
          { label: "Running", value: `${runningCount}/${agents.length}`, icon: Activity, color: "text-emerald-400" },
          { label: "CPU Usage", value: `${totalCpu}%`, icon: Cpu, color: "text-blue-400" },
          { label: "Memory", value: `${totalMem} MB`, icon: MemoryStick, color: "text-violet-400" },
          { label: "Isolation", value: "Active", icon: Lock, color: "text-amber-400" },
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
        <Tabs defaultValue="containers" className="h-full flex flex-col">
          <div className="px-6 pt-4 shrink-0">
            <TabsList className="bg-muted/30 h-9">
              <TabsTrigger value="containers" className="text-xs gap-1.5"><Boxes className="h-3.5 w-3.5" />Containers</TabsTrigger>
              <TabsTrigger value="swarms" className="text-xs gap-1.5"><GitBranch className="h-3.5 w-3.5" />Swarms</TabsTrigger>
              <TabsTrigger value="logs" className="text-xs gap-1.5"><Terminal className="h-3.5 w-3.5" />Logs</TabsTrigger>
              <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
            </TabsList>
          </div>

          {/* Containers tab */}
          <TabsContent value="containers" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`p-4 border ${statusBg[agent.status]} bg-card/50`}>
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${agent.bgColor} flex items-center justify-center shrink-0`}>
                          <Bot className={`h-5 w-5 ${agent.color}`} />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading font-semibold text-sm">{agent.name}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${statusBg[agent.status]} ${statusColor[agent.status]} border-0`}>
                              {agent.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">{agent.id}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{agent.cpu}% CPU</span>
                            <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />{agent.mem} MB</span>
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{agent.tasks} tasks</span>
                            <span className="flex items-center gap-1"><Bot className="h-3 w-3" />{agent.model}</span>
                          </div>
                        </div>
                        {/* CPU bar */}
                        <div className="w-24 hidden md:block">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>CPU</span><span>{agent.cpu}%</span>
                          </div>
                          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${agent.cpu > 60 ? "bg-red-400" : agent.cpu > 30 ? "bg-amber-400" : "bg-emerald-400"}`}
                              style={{ width: `${agent.cpu}%` }}
                            />
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toast.info(`Opening logs for ${agent.name}...`)}
                          >
                            <Terminal className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toast.info(`Settings for ${agent.name}...`)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={agent.status === "running" ? "destructive" : "default"}
                            className="text-xs h-8 px-3"
                            onClick={() => toggleAgent(agent.id)}
                          >
                            {agent.status === "running" ? "Stop" : "Start"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Swarms tab */}
          <TabsContent value="swarms" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="mb-6">
                <h3 className="text-sm font-heading font-semibold mb-1">Agent Swarm Templates</h3>
                <p className="text-xs text-muted-foreground">Launch coordinated teams of specialized NanoClaw containers that collaborate on complex tasks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SWARM_TEMPLATES.map((tmpl, i) => (
                  <motion.div key={tmpl.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="p-5 border border-border/40 bg-card/50 hover:border-primary/30 transition-colors group cursor-pointer"
                      onClick={() => toast.success(`Launching ${tmpl.name}...`)}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <tmpl.icon className={`h-5 w-5 ${tmpl.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-heading font-semibold text-sm">{tmpl.name}</span>
                            <Badge variant="secondary" className="text-[10px]">{tmpl.agents} agents</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{tmpl.description}</p>
                          <Button size="sm" className="text-xs h-7 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                            <Play className="h-3 w-3" />
                            Launch Swarm
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl border border-dashed border-border/60 text-center">
                <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-heading font-medium mb-1">Build Custom Swarm</p>
                <p className="text-xs text-muted-foreground mb-3">Define your own agent team with custom roles, models, and coordination logic.</p>
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => toast.info("Custom swarm builder coming soon!")}>
                  <Plus className="h-3.5 w-3.5" />
                  Create Swarm
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Logs tab */}
          <TabsContent value="logs" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live container logs</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={() => setActiveLog(l => !l)}>
                  <RefreshCw className={`h-3 w-3 ${activeLog ? "animate-spin" : ""}`} />
                  {activeLog ? "Pause" : "Resume"}
                </Button>
              </div>
              <div className="flex-1 bg-black/60 rounded-xl border border-border/30 overflow-hidden font-mono text-xs">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-1">
                    {CONTAINER_LOGS.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-muted-foreground/50 shrink-0">{log.time}</span>
                        <span className={`shrink-0 w-10 ${log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-amber-400" : log.level === "TOOL" ? "text-blue-400" : "text-emerald-400"}`}>
                          {log.level}
                        </span>
                        <span className="text-foreground/80">{log.msg}</span>
                      </motion.div>
                    ))}
                    {activeLog && (
                      <div className="flex items-center gap-2 text-muted-foreground/50">
                        <span className="animate-pulse">▋</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Security tab */}
          <TabsContent value="security" className="flex-1 overflow-hidden m-0 px-6 pb-6 pt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-heading font-semibold text-sm">Security Status: Nominal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All containers running within defined security boundaries. No policy violations detected.</p>
                </div>
                {[
                  { icon: Container, title: "Container Isolation", desc: "Each agent runs in its own Docker container with no shared filesystem or network namespace.", status: "Active" },
                  { icon: Network, title: "Network Policy", desc: "Egress filtered — containers can only reach pre-approved endpoints. No lateral movement.", status: "Active" },
                  { icon: Lock, title: "Read-Only Filesystem", desc: "Container filesystems are read-only by default. Writes go to ephemeral tmpfs volumes.", status: "Active" },
                  { icon: Cpu, title: "Resource Limits", desc: "CPU and memory caps enforced per container. No single agent can starve the swarm.", status: "Active" },
                  { icon: Shield, title: "Secrets Management", desc: "API keys injected via env at runtime — never baked into images. Rotated per session.", status: "Active" },
                  { icon: AlertCircle, title: "Audit Logging", desc: "All tool calls, network requests, and file operations logged to immutable audit trail.", status: "Active" },
                ].map((item) => (
                  <Card key={item.title} className="p-4 border border-border/40 bg-card/50">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading font-semibold text-sm">{item.title}</span>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{item.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
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

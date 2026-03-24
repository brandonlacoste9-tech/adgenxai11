/* ═══════════════════════════════════════════════════════
   OpenClaw — Agent builder & My Agents. Marketplace empty until you add a catalog API.
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Search,
  Plus,
  Star,
  Code2,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Send,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  MessageSquare,
  Settings2,
  X,
  ArrowLeft,
  Eye,
  Cpu,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useAgent } from "@/contexts/AgentContext";
import { Link } from "wouter";
import {
  agentLabelToChatModelId,
  canCallChatApiForModel,
  postChat,
  wizardModelValueToChatId,
} from "@/lib/agent-chat";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  stars: number;
  downloads: number;
  model: string;
  author: string;
  featured?: boolean;
  systemPrompt: string;
  temperature: number;
  tools: string[];
  active?: boolean;
  createdAt?: string;
  usageCount?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CATEGORIES = ["All", "Development", "Writing", "Analytics", "Security", "Language", "Design", "Marketing"];
const MODELS = [
  { value: "gpt-4.1", label: "GPT-4.1 (OpenAI)" },
  { value: "claude-3.5", label: "Claude 3.5 Sonnet" },
  { value: "deepseek-r1", label: "DeepSeek R1" },
  { value: "moonshot-128k", label: "Kimi 128K" },
  { value: "llama-3.1", label: "Llama 3.1 70B (Local)" },
];
const AVAILABLE_TOOLS = [
  { id: "web_search", label: "Web Search", description: "Search the internet for current information" },
  { id: "code_execution", label: "Code Execution", description: "Run and test code snippets" },
  { id: "data_analysis", label: "Data Analysis", description: "Process and analyze structured data" },
  { id: "image_generation", label: "Image Generation", description: "Generate images via DALL-E or Stable Diffusion" },
  { id: "knowledge_base", label: "Knowledge Base", description: "Query your uploaded documents" },
];

interface WizardState {
  step: number;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  tools: string[];
}

function AgentBuilderWizard({ onClose, onSave }: { onClose: () => void; onSave: (agent: Agent) => void }) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    name: "",
    description: "",
    category: "Development",
    systemPrompt: "",
    model: "gpt-4.1",
    temperature: 0.5,
    tools: [],
  });
  const [testMessages, setTestMessages] = useState<ChatMessage[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const handleTestSend = async () => {
    if (!testInput.trim() || testLoading) return;
    const userMsg = testInput.trim();
    setTestInput("");
    const userEntry: ChatMessage = { id: nanoid(), role: "user", content: userMsg };
    const thread = [...testMessages, userEntry];
    setTestMessages(thread);
    const chatId = wizardModelValueToChatId(state.model);
    if (!canCallChatApiForModel(chatId)) {
      toast.error("Add an API key in Settings for this provider, or run Ollama locally for Llama.");
      return;
    }
    setTestLoading(true);
    try {
      const messages = thread.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      const text = await postChat(messages, chatId, {
        promptJob: "chat",
        systemPromptExtension: state.systemPrompt.trim() || "You are a helpful assistant.",
      });
      setTestMessages((prev) => [...prev, { id: nanoid(), role: "assistant", content: text }]);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  const handleSave = () => {
    if (!state.name.trim()) {
      toast.error("Agent name is required");
      return;
    }
    if (!state.systemPrompt.trim()) {
      toast.error("System prompt is required");
      return;
    }
    const newAgent: Agent = {
      id: nanoid(),
      name: state.name,
      description: state.description || `Custom ${state.category} agent`,
      category: state.category,
      icon: Bot,
      iconColor: "text-primary",
      stars: 0,
      downloads: 0,
      model: MODELS.find((m) => m.value === state.model)?.label.split(" (")[0] || state.model,
      author: "You",
      systemPrompt: state.systemPrompt,
      temperature: state.temperature,
      tools: state.tools,
      active: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    onSave(newAgent);
    toast.success(`${state.name} saved to My Agents.`);
    onClose();
  };

  const steps = [
    { label: "Identity", icon: Bot },
    { label: "Prompt", icon: MessageSquare },
    { label: "Config", icon: Settings2 },
    { label: "Test", icon: Play },
  ];

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <h2 className="text-lg font-heading font-bold">Build an Agent</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Test step uses your Chat API keys from Settings</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 py-4 flex-wrap">
        {steps.map((s, i) => {
          const stepNum = i + 1;
          const isActive = state.step === stepNum;
          const isDone = state.step > stepNum;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => isDone && update({ step: stepNum })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                      : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className={`h-px w-6 ${isDone ? "bg-primary/40" : "bg-border/40"}`} />}
            </div>
          );
        })}
      </div>

      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 pr-2"
          >
            {state.step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">
                    Agent Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={state.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="e.g., My Code Reviewer"
                    className="bg-input/30"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">Short Description</Label>
                  <Input
                    value={state.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="What does this agent do?"
                    className="bg-input/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">Category</Label>
                  <Select value={state.category} onValueChange={(v) => update({ category: v })}>
                    <SelectTrigger className="bg-input/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {state.step === 2 && (
              <div className="space-y-2">
                <Label className="font-heading text-sm">
                  System Prompt <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={state.systemPrompt}
                  onChange={(e) => update({ systemPrompt: e.target.value })}
                  placeholder={`You are an expert ${state.category.toLowerCase()} specialist...`}
                  className="bg-input/30 min-h-[200px] font-mono text-sm leading-relaxed"
                  autoFocus
                />
              </div>
            )}

            {state.step === 3 && (
              <>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">Model</Label>
                  <Select value={state.model} onValueChange={(v) => update({ model: v })}>
                    <SelectTrigger className="bg-input/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-heading text-sm">Temperature</Label>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {state.temperature.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[state.temperature]}
                    onValueChange={([v]) => update({ temperature: v })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-heading text-sm">Tools (metadata only — not executed here)</Label>
                  <div className="space-y-2">
                    {AVAILABLE_TOOLS.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30"
                      >
                        <div>
                          <p className="text-sm font-heading font-medium">{tool.label}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                        <Switch
                          checked={state.tools.includes(tool.id)}
                          onCheckedChange={(checked) =>
                            update({
                              tools: checked ? [...state.tools, tool.id] : state.tools.filter((t) => t !== tool.id),
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {state.step === 4 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-heading font-semibold">{state.name || "Your Agent"}</p>
                    <p className="text-xs text-muted-foreground">
                      {MODELS.find((m) => m.value === state.model)?.label} · temp {state.temperature.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="border border-border/40 rounded-xl overflow-hidden">
                  <ScrollArea className="h-[240px] p-3">
                    {testMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Sparkles className="h-8 w-8 text-primary/40 mb-3" />
                        <p className="text-sm text-muted-foreground">Send a message — uses /api/chat when keys are set</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/40 text-foreground"
                              }`}
                            >
                              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.content}</pre>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <div className="border-t border-border/40 p-2 flex gap-2">
                    <Input
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleTestSend()}
                      placeholder="Test your agent..."
                      className="bg-transparent border-0 focus-visible:ring-0 text-sm h-8"
                      disabled={testLoading}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={handleTestSend}
                      disabled={testLoading || !testInput.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="font-heading gap-1.5 bg-transparent"
          onClick={() => (state.step > 1 ? update({ step: state.step - 1 }) : onClose())}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {state.step > 1 ? "Back" : "Cancel"}
        </Button>
        {state.step < 4 ? (
          <Button
            size="sm"
            className="font-heading gap-1.5"
            onClick={() => {
              if (state.step === 1 && !state.name.trim()) {
                toast.error("Enter an agent name to continue");
                return;
              }
              if (state.step === 2 && !state.systemPrompt.trim()) {
                toast.error("Add a system prompt to continue");
                return;
              }
              update({ step: state.step + 1 });
            }}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="font-heading gap-1.5" onClick={handleSave}>
            <Sparkles className="h-3.5 w-3.5" /> Save Agent
          </Button>
        )}
      </div>
    </div>
  );
}

function AgentChatPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const userEntry: ChatMessage = { id: nanoid(), role: "user", content: userMsg };
    const thread = [...messages, userEntry];
    setMessages(thread);
    const chatId = agentLabelToChatModelId(agent.model);
    if (!canCallChatApiForModel(chatId)) {
      toast.error("Add an API key in Settings for this model’s provider.");
      return;
    }
    setLoading(true);
    try {
      const apiMessages = thread.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      const text = await postChat(apiMessages, chatId, {
        promptJob: "chat",
        systemPromptExtension: agent.systemPrompt.trim() || "You are a helpful assistant.",
      });
      setMessages((prev) => [...prev, { id: nanoid(), role: "assistant", content: text }]);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border/40 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <agent.icon className={`h-4 w-4 ${agent.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-semibold truncate">{agent.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {agent.model} · {agent.category}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-heading shrink-0">
          {agent.tools.length} tools
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Messages go to <code className="text-xs">/api/chat</code> using Settings API keys.
            </p>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <agent.icon className={`h-3.5 w-3.5 ${agent.iconColor}`} />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/40 text-foreground rounded-tl-sm"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t border-border/40 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Message ${agent.name}...`}
            className="bg-input/30 border-border/40 pr-12 h-10"
            disabled={loading}
          />
          <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AgentDetailPanel({
  agent,
  onClose,
  onDelete,
  onToggle,
}: {
  agent: Agent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [showChat, setShowChat] = useState(false);

  if (showChat) return <AgentChatPanel agent={agent} onClose={() => setShowChat(false)} />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border/40 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-heading font-semibold text-sm flex-1">Agent Details</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => {
            onDelete(agent.id);
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-5 max-w-2xl">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <agent.icon className={`h-7 w-7 ${agent.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-lg">{agent.name}</h3>
                <Badge variant={agent.active ? "default" : "secondary"} className="text-xs">
                  {agent.active ? "Active" : "Paused"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Model", value: agent.model, icon: Cpu },
              { label: "Category", value: agent.category, icon: Layers },
              { label: "Temperature", value: agent.temperature?.toFixed(1) ?? "0.5", icon: Settings2 },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-heading font-semibold mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="font-heading text-sm flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> System Prompt
            </Label>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {agent.systemPrompt || "No system prompt configured."}
              </pre>
            </div>
          </div>

          {agent.tools && agent.tools.length > 0 && (
            <div className="space-y-2">
              <Label className="font-heading text-sm flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Declared Tools
              </Label>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((toolId) => {
                  const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);
                  return tool ? (
                    <Badge key={toolId} variant="secondary" className="text-xs font-heading">
                      {tool.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 font-heading gap-2" onClick={() => setShowChat(true)}>
              <MessageSquare className="h-4 w-4" /> Open Chat
            </Button>
            <Button variant="outline" className="font-heading gap-2 bg-transparent" onClick={() => onToggle(agent.id)}>
              {agent.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {agent.active ? "Pause" : "Activate"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function AgentsPage() {
  const { setActiveAgent, setInstalledAgents } = useAgent();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("marketplace");

  const marketplaceAgents: Agent[] = [];

  const filteredAgents = marketplaceAgents.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    return matchSearch && matchCategory;
  });

  const syncToContext = (agents: Agent[]) => {
    setInstalledAgents(
      agents
        .filter((a) => a.active)
        .map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          category: a.category,
          model: a.model,
          systemPrompt: a.systemPrompt,
          temperature: a.temperature,
          tools: a.tools,
          iconColor: a.iconColor,
        })),
    );
  };

  const handleDeleteAgent = (id: string) => {
    const updated = myAgents.filter((a) => a.id !== id);
    setMyAgents(updated);
    syncToContext(updated);
    toast.success("Agent removed");
  };

  const handleToggleAgent = (id: string) => {
    const updated = myAgents.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    setMyAgents(updated);
    syncToContext(updated);
  };

  const handleUseInCodeBuilder = (agent: Agent) => {
    setActiveAgent({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      tools: agent.tools,
      iconColor: agent.iconColor,
    });
    toast.success(`${agent.name} set for Code Builder`);
  };

  if (chatAgent) {
    return <AgentChatPanel agent={chatAgent} onClose={() => setChatAgent(null)} />;
  }

  if (selectedAgent) {
    return (
      <AgentDetailPanel
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onDelete={handleDeleteAgent}
        onToggle={handleToggleAgent}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">OpenClaw</h1>
          <Badge variant="outline" className="text-xs font-heading text-muted-foreground">
            Agents
          </Badge>
        </div>
        <Button size="sm" className="gap-1.5 font-heading text-xs" onClick={() => setShowBuilder(true)}>
          <Plus className="h-3.5 w-3.5" /> Build Agent
        </Button>
      </div>

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <AgentBuilderWizard
            onClose={() => setShowBuilder(false)}
            onSave={(agent) => {
              const updated = [agent, ...myAgents];
              setMyAgents(updated);
              syncToContext(updated);
              setActiveTab("my-agents");
            }}
          />
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 shrink-0">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="marketplace" className="gap-1.5 font-heading text-xs">
              <Star className="h-3.5 w-3.5" /> Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-agents" className="gap-1.5 font-heading text-xs">
              <Bot className="h-3.5 w-3.5" /> My Agents ({myAgents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace" className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <div className="flex gap-3 my-3 shrink-0 flex-wrap">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-9 bg-input/30 border-border/40 font-heading text-sm h-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  className={`text-xs font-heading h-9 shrink-0 ${category !== cat ? "bg-transparent" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
                <Star className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <h3 className="font-heading font-semibold mb-2">No marketplace catalog</h3>
                <p className="text-sm text-muted-foreground">
                  Demo agent cards were removed. Wire this tab to your own registry or API when you have listings to
                  show.
                </p>
              </div>
            ) : null}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="my-agents" className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <ScrollArea className="flex-1 mt-3">
            {myAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bot className="h-10 w-10 text-primary/40 mb-4" />
                <h3 className="text-lg font-heading font-semibold mb-2">No agents yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Build an agent with the wizard. Chat and tests use the same <code className="text-xs">/api/chat</code>{" "}
                  route as Chat Studio.
                </p>
                <Button className="font-heading gap-2" onClick={() => setShowBuilder(true)}>
                  <Plus className="h-4 w-4" /> Build Agent
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {myAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`border-border/40 bg-card/60 hover:border-primary/30 transition-all ${!agent.active ? "opacity-60" : ""}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <agent.icon className={`h-5 w-5 ${agent.iconColor}`} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-heading flex items-center gap-2">
                              {agent.name}
                              <Badge variant={agent.active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                {agent.active ? "Active" : "Paused"}
                              </Badge>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{agent.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedAgent(agent)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleAgent(agent.id)}>
                            {agent.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs leading-relaxed mb-3 line-clamp-2">{agent.description}</CardDescription>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs font-heading gap-1.5"
                          onClick={() => setChatAgent(agent)}
                          disabled={!agent.active}
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Chat
                        </Button>
                        <Link href="/code">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-heading bg-transparent gap-1"
                            onClick={() => handleUseInCodeBuilder(agent)}
                            disabled={!agent.active}
                          >
                            <Code2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-heading bg-transparent" onClick={() => setSelectedAgent(agent)}>
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

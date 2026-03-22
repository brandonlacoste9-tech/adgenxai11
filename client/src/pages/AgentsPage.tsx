/* ═══════════════════════════════════════════════════════
   OpenClaw — Agent Studio & Marketplace
   AdGenXAI Amber Atelier
   Full experience: builder wizard, test chat, My Agents,
   agent detail, marketplace, streaming simulation.
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Search, Plus, Star, Download, Code2, Pen, BarChart3, Shield,
  Zap, Globe, Sparkles, Users, TrendingUp, ChevronRight, ChevronLeft,
  Send, Trash2, Edit3, Copy, Play, Pause, MoreHorizontal, CheckCircle2,
  MessageSquare, Settings2, Layers, X, ArrowLeft, Eye, ToggleLeft,
  ToggleRight, Clock, Cpu, BookOpen, Palette, Music, FlaskConical,
  Camera, ShoppingCart, Briefcase, Heart, Lightbulb, Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useAgent } from "@/contexts/AgentContext";
import { Link } from "wouter";

/* ─── Types ─────────────────────────────────────────── */
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
  streaming?: boolean;
}

/* ─── Simulated responses per agent type ────────────── */
const AGENT_RESPONSES: Record<string, string[]> = {
  Development: [
    "Here's a production-ready implementation:\n\n```typescript\nimport { useState, useCallback } from 'react';\n\ninterface UseAsyncOptions<T> {\n  onSuccess?: (data: T) => void;\n  onError?: (error: Error) => void;\n}\n\nexport function useAsync<T>(\n  asyncFn: () => Promise<T>,\n  options?: UseAsyncOptions<T>\n) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n\n  const execute = useCallback(async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      const result = await asyncFn();\n      setData(result);\n      options?.onSuccess?.(result);\n    } catch (err) {\n      const error = err instanceof Error ? err : new Error(String(err));\n      setError(error);\n      options?.onError?.(error);\n    } finally {\n      setLoading(false);\n    }\n  }, [asyncFn]);\n\n  return { data, loading, error, execute };\n}\n```\n\nThis hook handles all async states cleanly with TypeScript generics and proper error boundaries.",
    "I've analyzed your architecture. Here are my recommendations:\n\n**Performance bottlenecks identified:**\n1. N+1 query pattern in the user resolver — batch with DataLoader\n2. Missing indexes on `created_at` and `user_id` columns\n3. No caching layer — add Redis for hot paths\n\n**Suggested refactor:**\n```sql\nCREATE INDEX CONCURRENTLY idx_posts_user_created \nON posts(user_id, created_at DESC);\n```\n\nThis alone should reduce query time by ~80% on the feed endpoint.",
    "Let me scaffold that component for you:\n\n```tsx\n'use client';\n\nimport { motion } from 'framer-motion';\nimport { cn } from '@/lib/utils';\n\ninterface CardProps extends React.HTMLAttributes<HTMLDivElement> {\n  variant?: 'default' | 'glass' | 'elevated';\n  hoverable?: boolean;\n}\n\nexport function Card({ variant = 'default', hoverable = true, className, children, ...props }: CardProps) {\n  return (\n    <motion.div\n      whileHover={hoverable ? { y: -2, scale: 1.01 } : undefined}\n      transition={{ duration: 0.2 }}\n      className={cn(\n        'rounded-xl border',\n        variant === 'glass' && 'bg-white/5 backdrop-blur-md border-white/10',\n        variant === 'elevated' && 'bg-card shadow-lg border-border/40',\n        className\n      )}\n      {...props}\n    >\n      {children}\n    </motion.div>\n  );\n}\n```",
  ],
  Writing: [
    "Here's a compelling landing page headline sequence:\n\n**Hero:** *Stop juggling 12 AI tools. Use one.*\n**Subheadline:** AdGenXAI brings GPT-4.1, Claude, DeepSeek, and your entire AI workflow into a single, beautifully crafted studio.\n\n**Feature callouts:**\n- ⚡ Build apps and see them live — not just code\n- 🤖 Deploy agents with OpenClaw in minutes\n- 🔒 Your API keys stay local, always\n\n**CTA:** *Start building free — 50 credits, no card required*\n\nThe copy leads with the pain point (tool sprawl), pivots to the solution, and closes with a low-friction CTA.",
    "Blog post outline for \"Why Agentic AI is the Future of Software Development\":\n\n1. **The shift from tools to agents** — how we went from autocomplete to autonomous builders\n2. **The orchestration problem** — why single-model solutions fall short\n3. **Human-in-the-loop as a feature, not a bug** — the case for HITL architecture\n4. **Real-world agent patterns** — code review agents, RAG pipelines, multi-step workflows\n5. **What to build next** — practical starting points for developers\n\nEstimated read time: 8 minutes. Target audience: senior developers and technical founders.",
    "Here's a polished product description:\n\n**OpenClaw** is the agent studio that doesn't get in your way. Build custom AI agents with precise system prompts, choose from 5 frontier models, and deploy them to your workflow in minutes. Browse the marketplace for battle-tested agents built by the community, or craft your own from scratch. Every agent runs with your API keys — your data never leaves your control.",
  ],
  Analytics: [
    "Based on the dataset you described, here's my analysis approach:\n\n**Step 1 — Data quality check:**\n```python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('data.csv')\nprint(f\"Shape: {df.shape}\")\nprint(f\"Missing values:\\n{df.isnull().sum()}\")\nprint(f\"Duplicates: {df.duplicated().sum()}\")\n```\n\n**Key insights to extract:**\n- Cohort retention curves by signup month\n- Revenue per user segment (free vs paid)\n- Feature adoption funnel drop-off points\n\nI'd recommend a Sankey diagram for the funnel and a heatmap for cohort retention. Want me to generate the full visualization code?",
    "Here's a SQL query to get your weekly active user trend:\n\n```sql\nSELECT\n  DATE_TRUNC('week', event_at) AS week,\n  COUNT(DISTINCT user_id) AS wau,\n  COUNT(DISTINCT user_id) FILTER (WHERE plan = 'pro') AS pro_wau,\n  ROUND(\n    COUNT(DISTINCT user_id) FILTER (WHERE plan = 'pro')::numeric /\n    NULLIF(COUNT(DISTINCT user_id), 0) * 100, 2\n  ) AS pro_pct\nFROM events\nWHERE event_at >= NOW() - INTERVAL '90 days'\nGROUP BY 1\nORDER BY 1 DESC;\n```\n\nThis gives you WAU segmented by plan type with conversion percentage.",
  ],
  Security: [
    "Security audit complete. Here are the critical findings:\n\n**🔴 Critical (fix immediately):**\n1. SQL injection vulnerability in `/api/search?q=` — user input not sanitized\n2. JWT secret hardcoded in `config.js` — rotate immediately\n3. Missing rate limiting on `/api/auth/login` — brute force risk\n\n**🟡 Medium:**\n4. CORS policy too permissive — `origin: '*'` in production\n5. Sensitive data in client-side localStorage (tokens)\n6. No CSP headers configured\n\n**Fix for #1:**\n```typescript\n// ❌ Vulnerable\nconst query = `SELECT * FROM users WHERE name = '${req.query.name}'`;\n\n// ✅ Safe — parameterized query\nconst query = 'SELECT * FROM users WHERE name = $1';\nconst result = await db.query(query, [req.query.name]);\n```",
  ],
  Language: [
    "Translation complete (EN → FR):\n\n**Original:** \"Build apps and websites you can actually see. Chat with GPT-4.1, Claude, DeepSeek, and more.\"\n\n**French:** \"Créez des applications et des sites web que vous pouvez réellement voir. Discutez avec GPT-4.1, Claude, DeepSeek, et bien plus encore.\"\n\n**Note:** I used \"réellement voir\" (literally see/preview) rather than \"visualiser\" to keep the conversational tone of the original. The phrase \"et bien plus encore\" is more natural in French marketing copy than a direct translation of \"and more.\"",
  ],
  Design: [
    "UX audit complete for your onboarding flow:\n\n**Friction points identified:**\n1. **Step 3 (API key entry)** — 68% of users drop here. The form feels like a wall. Consider making this optional with a \"Try with demo key\" path.\n2. **No progress indicator** — users don't know how many steps remain\n3. **Error messages are technical** — \"Invalid API key format\" should be \"That doesn't look like an OpenAI key — they start with sk-proj-\"\n\n**Recommended persona:** *The Curious Developer* — technically capable but time-poor. They want to see value in under 2 minutes before committing.\n\n**Quick wins:**\n- Add a step counter (\"Step 2 of 4\")\n- Pre-fill the API key field with a masked demo key\n- Add a \"Skip for now\" option on optional steps",
  ],
  Marketing: [
    "SEO analysis for your landing page:\n\n**Target keyword opportunities:**\n| Keyword | Monthly Volume | Difficulty | Current Rank |\n|---|---|---|---|\n| AI studio | 12,400 | 67 | Not ranking |\n| multi-model AI chat | 3,200 | 42 | Not ranking |\n| AI agent builder | 8,900 | 58 | Not ranking |\n| OpenAI Claude together | 5,100 | 35 | Not ranking |\n\n**Quick wins:**\n1. Add \"AI Studio\" to your H1 — currently missing\n2. Create a comparison page: \"AdGenXAI vs ChatGPT\" (low competition, high intent)\n3. Add FAQ schema markup — you're missing rich snippet opportunities\n4. Internal link from blog posts to feature pages\n\nEstimated traffic uplift with these changes: +340% in 90 days.",
  ],
};

function getAgentResponse(agent: Agent, userMessage: string): string {
  const responses = AGENT_RESPONSES[agent.category] || AGENT_RESPONSES["Development"];
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    return `Hey! I'm **${agent.name}**, your ${agent.category.toLowerCase()} specialist running on ${agent.model}. What are we building today?`;
  }
  if (lowerMsg.includes("help") || lowerMsg.includes("what can you")) {
    return `I specialize in **${agent.category}** tasks. Here's what I can do:\n\n${agent.description}\n\nJust describe what you need and I'll get to work.`;
  }
  return responses[Math.floor(Math.random() * responses.length)];
}

/* ─── Data ───────────────────────────────────────────── */
const MARKETPLACE_AGENTS: Agent[] = [
  { id: "1", name: "Full-Stack Dev", description: "Expert React/Next.js developer. Generates production-ready code with TypeScript, Tailwind, and best practices.", category: "Development", icon: Code2, iconColor: "text-blue-400", stars: 4850, downloads: 12400, model: "GPT-4.1", author: "AdGenXAI", featured: true, systemPrompt: "You are an expert full-stack developer specializing in React, Next.js, TypeScript, and Tailwind CSS. Generate production-ready, well-commented code following best practices.", temperature: 0.3, tools: ["code_execution", "web_search"] },
  { id: "2", name: "Content Writer", description: "Professional copywriter for blogs, landing pages, social media, and marketing materials.", category: "Writing", icon: Pen, iconColor: "text-purple-400", stars: 3200, downloads: 8900, model: "Claude 3.5", author: "AdGenXAI", featured: true, systemPrompt: "You are a professional copywriter with expertise in conversion-focused content, SEO writing, and brand voice consistency.", temperature: 0.7, tools: ["web_search"] },
  { id: "3", name: "Data Analyst", description: "Analyze datasets, create visualizations, and extract insights from CSV, JSON, and SQL data.", category: "Analytics", icon: BarChart3, iconColor: "text-green-400", stars: 2800, downloads: 6700, model: "GPT-4.1", author: "Community", systemPrompt: "You are a data analyst expert in Python, SQL, and data visualization. Provide clear, actionable insights from data.", temperature: 0.2, tools: ["code_execution", "data_analysis"] },
  { id: "4", name: "Security Auditor", description: "Review code for vulnerabilities, suggest fixes, and generate security reports.", category: "Security", icon: Shield, iconColor: "text-red-400", stars: 1900, downloads: 4200, model: "Claude 3.5", author: "Community", systemPrompt: "You are a cybersecurity expert specializing in code review, vulnerability assessment, and security best practices.", temperature: 0.1, tools: ["code_execution"] },
  { id: "5", name: "API Builder", description: "Design RESTful APIs, generate OpenAPI specs, and scaffold Express/Fastify backends.", category: "Development", icon: Zap, iconColor: "text-yellow-400", stars: 2100, downloads: 5100, model: "DeepSeek R1", author: "Community", systemPrompt: "You are an API design expert. Create clean, well-documented RESTful APIs with OpenAPI specs and production-ready scaffolding.", temperature: 0.3, tools: ["code_execution"] },
  { id: "6", name: "Translator Pro", description: "High-quality translation across 30+ languages with cultural context awareness.", category: "Language", icon: Globe, iconColor: "text-cyan-400", stars: 3500, downloads: 9800, model: "GPT-4.1", author: "AdGenXAI", featured: true, systemPrompt: "You are a professional translator with deep cultural knowledge. Provide accurate, natural-sounding translations that preserve tone and intent.", temperature: 0.3, tools: [] },
  { id: "7", name: "UX Researcher", description: "Conduct user research analysis, create personas, and generate usability reports.", category: "Design", icon: Users, iconColor: "text-pink-400", stars: 1500, downloads: 3200, model: "Claude 3.5", author: "Community", systemPrompt: "You are a UX research expert. Analyze user behavior, create detailed personas, and provide actionable design recommendations.", temperature: 0.5, tools: ["web_search"] },
  { id: "8", name: "SEO Optimizer", description: "Analyze content for SEO, suggest keywords, meta tags, and content improvements.", category: "Marketing", icon: TrendingUp, iconColor: "text-orange-400", stars: 2400, downloads: 6100, model: "GPT-4.1", author: "Community", systemPrompt: "You are an SEO specialist. Analyze content, identify keyword opportunities, and provide data-driven optimization recommendations.", temperature: 0.4, tools: ["web_search"] },
  { id: "9", name: "DevOps Engineer", description: "Docker, Kubernetes, CI/CD pipelines, and infrastructure-as-code with Terraform.", category: "Development", icon: Terminal, iconColor: "text-emerald-400", stars: 1800, downloads: 4500, model: "GPT-4.1", author: "Community", systemPrompt: "You are a DevOps engineer expert in containerization, orchestration, and CI/CD. Provide production-grade infrastructure solutions.", temperature: 0.2, tools: ["code_execution"] },
  { id: "10", name: "Product Manager", description: "Write PRDs, user stories, roadmaps, and prioritization frameworks.", category: "Writing", icon: Briefcase, iconColor: "text-indigo-400", stars: 2200, downloads: 5800, model: "Claude 3.5", author: "AdGenXAI", systemPrompt: "You are a senior product manager. Create clear, actionable product documents including PRDs, user stories, and strategic roadmaps.", temperature: 0.6, tools: [] },
  { id: "11", name: "ML Engineer", description: "Build ML pipelines, fine-tune models, and optimize inference performance.", category: "Analytics", icon: FlaskConical, iconColor: "text-violet-400", stars: 1600, downloads: 3900, model: "DeepSeek R1", author: "Community", systemPrompt: "You are an ML engineer specializing in model training, fine-tuning, and production deployment. Provide rigorous, mathematically sound solutions.", temperature: 0.2, tools: ["code_execution", "data_analysis"] },
  { id: "12", name: "Brand Designer", description: "Create brand identities, color palettes, typography systems, and design tokens.", category: "Design", icon: Palette, iconColor: "text-rose-400", stars: 1300, downloads: 2800, model: "Claude 3.5", author: "Community", systemPrompt: "You are a brand designer with expertise in visual identity systems. Create cohesive, memorable brand experiences.", temperature: 0.8, tools: [] },
];

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

/* ─── Agent Builder Wizard ───────────────────────────── */
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
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const streamResponse = useCallback((text: string) => {
    const msgId = nanoid();
    setTestMessages((prev) => [...prev, { id: msgId, role: "assistant", content: "", streaming: true }]);
    setIsStreaming(true);
    let i = 0;
    const interval = setInterval(() => {
      i += Math.floor(Math.random() * 4) + 2;
      const chunk = text.slice(0, i);
      setTestMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: chunk, streaming: i < text.length } : m));
      if (i >= text.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 18);
  }, []);

  const handleTestSend = () => {
    if (!testInput.trim() || isStreaming) return;
    const userMsg = testInput.trim();
    setTestInput("");
    setTestMessages((prev) => [...prev, { id: nanoid(), role: "user", content: userMsg }]);
    const mockAgent: Agent = { ...state, id: "preview", icon: Bot, iconColor: "text-primary", stars: 0, downloads: 0, author: "You" };
    setTimeout(() => streamResponse(getAgentResponse(mockAgent, userMsg)), 400);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  const handleSave = () => {
    if (!state.name.trim()) { toast.error("Agent name is required"); return; }
    if (!state.systemPrompt.trim()) { toast.error("System prompt is required"); return; }
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
    toast.success(`${state.name} created and ready in My Agents!`);
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
      {/* Wizard header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <h2 className="text-lg font-heading font-bold">Build an Agent</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by OpenClaw</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 py-4">
        {steps.map((s, i) => {
          const stepNum = i + 1;
          const isActive = state.step === stepNum;
          const isDone = state.step > stepNum;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <button
                onClick={() => isDone && update({ step: stepNum })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading transition-all ${
                  isActive ? "bg-primary text-primary-foreground" :
                  isDone ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" :
                  "bg-muted/40 text-muted-foreground"
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

      {/* Step content */}
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
            {/* Step 1 — Identity */}
            {state.step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">Agent Name <span className="text-destructive">*</span></Label>
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
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2 — System Prompt */}
            {state.step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">System Prompt <span className="text-destructive">*</span></Label>
                  <p className="text-xs text-muted-foreground">Define your agent's personality, expertise, and behavior. Be specific — the more detailed, the better.</p>
                  <Textarea
                    value={state.systemPrompt}
                    onChange={(e) => update({ systemPrompt: e.target.value })}
                    placeholder={`You are an expert ${state.category.toLowerCase()} specialist. You...\n\nAlways:\n- Provide production-ready output\n- Explain your reasoning\n- Ask clarifying questions when needed`}
                    className="bg-input/30 min-h-[200px] font-mono text-sm leading-relaxed"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-right">{state.systemPrompt.length} chars</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-heading font-medium text-primary mb-1">💡 Prompt tips</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Start with "You are an expert..." to set the role clearly</li>
                    <li>• Add "Always:" and "Never:" sections for consistent behavior</li>
                    <li>• Specify output format (markdown, JSON, code blocks)</li>
                    <li>• Include domain-specific context relevant to your use case</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 3 — Config */}
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
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-heading text-sm">Temperature</Label>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{state.temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[state.temperature]}
                    onValueChange={([v]) => update({ temperature: v })}
                    min={0} max={1} step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise & deterministic</span>
                    <span>Creative & varied</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-heading text-sm">Tools & Capabilities</Label>
                  <div className="space-y-2">
                    {AVAILABLE_TOOLS.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div>
                          <p className="text-sm font-heading font-medium">{tool.label}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                        <Switch
                          checked={state.tools.includes(tool.id)}
                          onCheckedChange={(checked) =>
                            update({ tools: checked ? [...state.tools, tool.id] : state.tools.filter((t) => t !== tool.id) })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4 — Test Chat */}
            {state.step === 4 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-semibold">{state.name || "Your Agent"}</p>
                    <p className="text-xs text-muted-foreground">{MODELS.find((m) => m.value === state.model)?.label} · temp {state.temperature.toFixed(1)}</p>
                  </div>
                </div>

                <div className="border border-border/40 rounded-xl overflow-hidden">
                  <ScrollArea className="h-[240px] p-3">
                    {testMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Sparkles className="h-8 w-8 text-primary/40 mb-3" />
                        <p className="text-sm text-muted-foreground">Send a message to test your agent</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/40 text-foreground"
                            }`}>
                              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.content}</pre>
                              {msg.streaming && <span className="inline-block w-1.5 h-3.5 bg-current ml-0.5 animate-pulse rounded-sm" />}
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
                      disabled={isStreaming}
                    />
                    <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleTestSend} disabled={isStreaming || !testInput.trim()}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="font-heading gap-1.5 bg-transparent"
          onClick={() => state.step > 1 ? update({ step: state.step - 1 }) : onClose()}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {state.step > 1 ? "Back" : "Cancel"}
        </Button>
        {state.step < 4 ? (
          <Button
            size="sm"
            className="font-heading gap-1.5"
            onClick={() => {
              if (state.step === 1 && !state.name.trim()) { toast.error("Enter an agent name to continue"); return; }
              if (state.step === 2 && !state.systemPrompt.trim()) { toast.error("Add a system prompt to continue"); return; }
              update({ step: state.step + 1 });
            }}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="font-heading gap-1.5" onClick={handleSave}>
            <Sparkles className="h-3.5 w-3.5" /> Deploy Agent
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Agent Chat Panel ───────────────────────────────── */
function AgentChatPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nanoid(), role: "assistant", content: `Hey! I'm **${agent.name}**. ${agent.description} What can I help you with?` }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const streamResponse = useCallback((text: string) => {
    const msgId = nanoid();
    setMessages((prev) => [...prev, { id: msgId, role: "assistant", content: "", streaming: true }]);
    setIsStreaming(true);
    let i = 0;
    const interval = setInterval(() => {
      i += Math.floor(Math.random() * 4) + 2;
      const chunk = text.slice(0, i);
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: chunk, streaming: i < text.length } : m));
      if (i >= text.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 18);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: nanoid(), role: "user", content: userMsg }]);
    setTimeout(() => streamResponse(getAgentResponse(agent, userMsg)), 500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border/40 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center`}>
          <agent.icon className={`h-4 w-4 ${agent.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-semibold truncate">{agent.name}</p>
          <p className="text-xs text-muted-foreground truncate">{agent.model} · {agent.category}</p>
        </div>
        <Badge variant="secondary" className="text-xs font-heading shrink-0">
          {agent.tools.length} tools
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4 max-w-3xl mx-auto">
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
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border/40 text-foreground rounded-tl-sm"
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                {msg.streaming && <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse rounded-sm" />}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/40 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Message ${agent.name}...`}
              className="bg-input/30 border-border/40 pr-12 h-10"
              disabled={isStreaming}
            />
          </div>
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Simulated responses · Connect Vertex AI for real inference
        </p>
      </div>
    </div>
  );
}

/* ─── Agent Detail Page ──────────────────────────────── */
function AgentDetailPanel({ agent, onClose, onDelete, onToggle }: {
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { onDelete(agent.id); onClose(); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-5 max-w-2xl">
          {/* Agent identity */}
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

          {/* Stats row */}
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

          {/* System prompt */}
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

          {/* Tools */}
          {agent.tools && agent.tools.length > 0 && (
            <div className="space-y-2">
              <Label className="font-heading text-sm flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Enabled Tools
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

          {/* Actions */}
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

/* ─── Main Page ──────────────────────────────────────── */
export default function AgentsPage() {
  const { setActiveAgent, setInstalledAgents } = useAgent();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("marketplace");

  const filteredAgents = MARKETPLACE_AGENTS.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    return matchSearch && matchCategory;
  });

  const syncToContext = (agents: Agent[]) => {
    setInstalledAgents(agents.filter((a) => a.active).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      model: a.model,
      systemPrompt: a.systemPrompt,
      temperature: a.temperature,
      tools: a.tools,
      iconColor: a.iconColor,
    })));
  };

  const handleInstall = (agent: Agent) => {
    if (myAgents.find((a) => a.id === agent.id)) {
      toast.info(`${agent.name} is already installed`);
      return;
    }
    const updated = [{ ...agent, active: true, createdAt: new Date().toISOString(), usageCount: 0 }, ...myAgents];
    setMyAgents(updated);
    syncToContext(updated);
    toast.success(`${agent.name} installed! Find it in My Agents.`);
  };

  const handleDeleteAgent = (id: string) => {
    const updated = myAgents.filter((a) => a.id !== id);
    setMyAgents(updated);
    syncToContext(updated);
    toast.success("Agent removed");
  };

  const handleToggleAgent = (id: string) => {
    const updated = myAgents.map((a) => a.id === id ? { ...a, active: !a.active } : a);
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
    toast.success(`${agent.name} set as Code Builder agent — head to Code Builder!`);
  };

  // Full-screen chat view
  if (chatAgent) {
    return <AgentChatPanel agent={chatAgent} onClose={() => setChatAgent(null)} />;
  }

  // Agent detail view
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
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">OpenClaw</h1>
          <Badge variant="secondary" className="text-xs font-heading">Agent Marketplace</Badge>
        </div>
        <Button size="sm" className="gap-1.5 font-heading text-xs" onClick={() => setShowBuilder(true)}>
          <Plus className="h-3.5 w-3.5" /> Build Agent
        </Button>
      </div>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <AgentBuilderWizard
            onClose={() => setShowBuilder(false)}
            onSave={(agent) => {
              setMyAgents((prev) => [agent, ...prev]);
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

        {/* Marketplace */}
        <TabsContent value="marketplace" className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <div className="flex gap-3 my-3 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const isInstalled = !!myAgents.find((a) => a.id === agent.id);
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/40 bg-card/60 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => handleInstall(agent)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <agent.icon className={`h-5 w-5 ${agent.iconColor}`} />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-heading flex items-center gap-2">
                                {agent.name}
                                {agent.featured && <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">Featured</Badge>}
                                {isInstalled && <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border-0">Installed</Badge>}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{agent.author} · {agent.model}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs leading-relaxed mb-3">{agent.description}</CardDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {agent.stars.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {agent.downloads.toLocaleString()}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={isInstalled ? "secondary" : "outline"}
                            className={`h-7 text-xs font-heading ${!isInstalled ? "bg-transparent" : ""}`}
                            onClick={(e) => { e.stopPropagation(); handleInstall(agent); }}
                          >
                            {isInstalled ? <><CheckCircle2 className="h-3 w-3 mr-1" />Installed</> : "Install"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* My Agents */}
        <TabsContent value="my-agents" className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <ScrollArea className="flex-1 mt-3">
            {myAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">No agents yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Browse the marketplace to install agents, or build your own with the OpenClaw wizard.
                </p>
                <Button className="font-heading gap-2" onClick={() => setShowBuilder(true)}>
                  <Plus className="h-4 w-4" /> Build Your First Agent
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {myAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`border-border/40 bg-card/60 hover:border-primary/30 transition-all group ${!agent.active ? "opacity-60" : ""}`}>
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
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedAgent(agent)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleAgent(agent.id)}>
                              {agent.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteAgent(agent.id)}>
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
                              title="Use this agent in Code Builder"
                            >
                              <Code2 className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-heading bg-transparent"
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

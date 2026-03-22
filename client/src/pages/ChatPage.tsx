/* ═══════════════════════════════════════════════════════
   Chat Studio — AdGenXAI Amber Atelier
   Multi-model chat with conversation history sidebar,
   model selector, markdown rendering, thinking sections.
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Streamdown } from "streamdown";
import {
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Copy,
  RefreshCw,
  Trash2,
  ChevronDown,
  Bot,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  thinking?: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
}

const MODELS = [
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek" },
  { id: "moonshot-128k", name: "Kimi 128K", provider: "Moonshot" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Ollama" },
];

const SAMPLE_RESPONSES: Record<string, string> = {
  "gpt-4.1": "I'm GPT-4.1 from OpenAI. I can help you with code generation, analysis, creative writing, and complex reasoning tasks. What would you like to build today?",
  "claude-3.5-sonnet": "Hello! I'm Claude 3.5 Sonnet by Anthropic. I excel at nuanced analysis, careful reasoning, and producing high-quality code. How can I assist you?",
  "deepseek-r1": "I'm DeepSeek R1, specialized in deep reasoning and step-by-step problem solving. I'll show my thinking process as I work through your request.",
  "moonshot-128k": "I'm Kimi with a 128K context window from Moonshot AI. I can process extremely long documents and maintain context across extensive conversations.",
  "llama-3.1-70b": "I'm Llama 3.1 70B running locally via Ollama. I provide fast, private inference without sending data to external servers.",
};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "default",
      title: "New Chat",
      model: "gpt-4.1",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState("default");
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv.messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedConvs = conversations.map((c) => {
      if (c.id !== activeConvId) return c;
      const newTitle = c.messages.length === 0 ? input.trim().slice(0, 40) : c.title;
      return { ...c, title: newTitle, messages: [...c.messages, userMsg] };
    });
    setConversations(updatedConvs);
    setInput("");
    setIsStreaming(true);

    // Simulate AI response
    setTimeout(() => {
      const thinking = selectedModel === "deepseek-r1"
        ? "Let me analyze this step by step...\n1. Understanding the request\n2. Formulating a comprehensive response\n3. Verifying accuracy"
        : undefined;

      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: SAMPLE_RESPONSES[selectedModel] || "I'm here to help! What would you like to build?",
        model: selectedModel,
        thinking,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          return { ...c, messages: [...c.messages, aiMsg] };
        })
      );
      setIsStreaming(false);
    }, 1200);
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "New Chat",
      model: selectedModel,
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const handleDeleteConv = (id: string) => {
    if (conversations.length <= 1) {
      toast.error("Can't delete the last conversation");
      return;
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConvId === id) setActiveConvId(filtered[0].id);
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30">
        <div className="p-3">
          <Button
            variant="outline"
            className="w-full gap-2 font-heading bg-transparent text-sm"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <Separator className="opacity-30" />
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                  conv.id === activeConvId
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConv(conv.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-52 h-9 bg-input/30 border-border/40 font-heading text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <span>{m.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{m.provider}</Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="font-heading text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-primary" /> 50 credits
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6">
          {activeConv.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-glow">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Ask anything — generate code, analyze data, brainstorm ideas, or build your next app.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 max-w-md justify-center">
                {["Build a landing page", "Explain React hooks", "Write a Python script", "Design a database schema"].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent font-heading"
                    onClick={() => {
                      setInput(prompt);
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConv.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                    {msg.thinking && (
                      <div className="mb-2 p-3 rounded-lg bg-muted/50 border border-border/30 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 mb-1 font-heading font-medium text-primary">
                          <ChevronDown className="h-3 w-3" /> Thinking
                        </div>
                        <pre className="whitespace-pre-wrap">{msg.thinking}</pre>
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-card border border-border/40"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {msg.model && (
                          <span className="text-[10px] text-muted-foreground ml-1">{msg.model}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border/40 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full thinking-indicator" />
                      <span className="w-2 h-2 bg-primary/60 rounded-full thinking-indicator" style={{ animationDelay: "0.2s" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full thinking-indicator" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/40 p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 h-11 bg-input/30 border-border/40 font-heading text-sm"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-11 w-11"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

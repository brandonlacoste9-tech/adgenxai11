/* ═══════════════════════════════════════════════════════
   Knowledge Base — AdGenXAI Amber Atelier
   Upload docs, manage knowledge bases, chat with RAG.
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Upload,
  FileText,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  FolderOpen,
  File,
  Database,
} from "lucide-react";
import { toast } from "sonner";

interface KnowledgeBase {
  id: string;
  name: string;
  documents: number;
  chunks: number;
  size: string;
  lastUpdated: string;
  status: "ready" | "processing" | "error";
}

const SAMPLE_KBS: KnowledgeBase[] = [
  { id: "1", name: "React Documentation", documents: 42, chunks: 1280, size: "15.2 MB", lastUpdated: "2 hours ago", status: "ready" },
  { id: "2", name: "Company Policies", documents: 8, chunks: 340, size: "4.1 MB", lastUpdated: "1 day ago", status: "ready" },
  { id: "3", name: "API Reference", documents: 15, chunks: 890, size: "8.7 MB", lastUpdated: "3 hours ago", status: "processing" },
];

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState(SAMPLE_KBS);
  const [search, setSearch] = useState("");

  const filtered = knowledgeBases.filter((kb) =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const newKb: KnowledgeBase = {
      id: String(Date.now()),
      name: "New Knowledge Base",
      documents: 0,
      chunks: 0,
      size: "0 MB",
      lastUpdated: "just now",
      status: "ready",
    };
    setKnowledgeBases((prev) => [newKb, ...prev]);
    toast.success("Knowledge base created! Upload documents to get started.");
  };

  const handleDelete = (id: string) => {
    setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
    toast.success("Knowledge base deleted");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Knowledge Base</h1>
          <Badge variant="secondary" className="text-xs font-heading">
            <Database className="h-3 w-3 mr-1" /> RAG Pipeline
          </Badge>
        </div>
        <Button size="sm" className="gap-1.5 font-heading text-xs" onClick={handleCreate}>
          <Plus className="h-3.5 w-3.5" /> New Base
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {/* Search */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge bases..."
            className="pl-9 bg-input/30 border-border/40 font-heading text-sm h-9"
          />
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">No knowledge bases</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Create a knowledge base and upload documents to start chatting with your data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((kb) => (
                <Card key={kb.id} className="border-border/40 bg-card/60 hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-heading">{kb.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{kb.lastUpdated}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          kb.status === "ready" ? "text-green-500" :
                          kb.status === "processing" ? "text-yellow-500" : "text-red-500"
                        }`}
                      >
                        {kb.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-heading font-bold">{kb.documents}</p>
                        <p className="text-[10px] text-muted-foreground">Docs</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-heading font-bold">{kb.chunks.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Chunks</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-heading font-bold">{kb.size}</p>
                        <p className="text-[10px] text-muted-foreground">Size</p>
                      </div>
                    </div>
                    {kb.status === "processing" && (
                      <div className="mb-3">
                        <Progress value={67} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1">Processing documents... 67%</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs font-heading bg-transparent gap-1" onClick={() => toast.info("Feature coming soon")}>
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs font-heading bg-transparent gap-1" onClick={() => toast.info("Feature coming soon")}>
                        <MessageSquare className="h-3 w-3" /> Chat
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(kb.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

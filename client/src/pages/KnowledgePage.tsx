/* ═══════════════════════════════════════════════════════
   Knowledge — collections, .txt/.md ingest, OpenAI embeddings, semantic search
   ═══════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Plus, Search, FolderOpen, Database, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeCollectionDto, KnowledgeQueryHitDto } from "@shared/studio-api";
import {
  createKnowledgeCollection,
  deleteKnowledgeCollection,
  fetchKnowledgeCollections,
  queryKnowledge,
  uploadKnowledgeDocument,
} from "@/lib/studio-client";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunk) {
    parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]));
  }
  return btoa(parts.join(""));
}

export default function KnowledgePage() {
  const [collections, setCollections] = useState<KnowledgeCollectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<KnowledgeQueryHitDto[] | null>(null);
  const [searching, setSearching] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchKnowledgeCollections();
      setCollections(list);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list[0]?.id ?? "";
      });
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async () => {
    try {
      const col = await createKnowledgeCollection(newName.trim() || "My knowledge base");
      setNewName("");
      toast.success(`Created “${col.name}”`);
      await refresh();
      setSelectedId(col.id);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledgeCollection(id);
      toast.success("Collection deleted");
      if (selectedId === id) setSelectedId("");
      await refresh();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedId) {
      if (!selectedId) toast.error("Select a collection first");
      return;
    }
    const lower = file.name.toLowerCase();
    const isPdf = lower.endsWith(".pdf");
    const isText = lower.endsWith(".txt") || lower.endsWith(".md");
    if (!isPdf && !isText) {
      toast.error("Use .txt, .md, or .pdf");
      return;
    }
    try {
      let chunkCount: number;
      if (isPdf) {
        const buf = await file.arrayBuffer();
        if (buf.byteLength > 18 * 1024 * 1024) {
          toast.error("PDF is too large for this upload path (~18MB). Split or export text.");
          return;
        }
        const b64 = arrayBufferToBase64(buf);
        const out = await uploadKnowledgeDocument(selectedId, file.name, { base64Content: b64 });
        chunkCount = out.chunkCount;
      } else {
        const text = await file.text();
        const out = await uploadKnowledgeDocument(selectedId, file.name, { textContent: text });
        chunkCount = out.chunkCount;
      }
      toast.success(`Indexed ${chunkCount} chunk(s) from ${file.name}`);
      await refresh();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const runQuery = async () => {
    if (!selectedId || !query.trim()) return;
    setSearching(true);
    setHits(null);
    try {
      const h = await queryKnowledge(selectedId, query.trim(), 8);
      setHits(h);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSearching(false);
    }
  };

  const selected = collections.find((c) => c.id === selectedId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Knowledge Base</h1>
          <Badge variant="outline" className="text-xs font-heading text-muted-foreground">
            <Database className="h-3 w-3 mr-1" /> Embeddings (OpenAI)
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New collection name…"
            className="h-9 w-40 sm:w-52 bg-input/30 border-border/40 font-heading text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button size="sm" className="gap-1.5 font-heading text-xs" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" /> New base
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-64 border-r border-border/40 flex flex-col shrink-0">
          <div className="p-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Collections</div>
          <ScrollArea className="flex-1 px-2 pb-4">
            {loading ? (
              <p className="text-sm text-muted-foreground px-2">Loading…</p>
            ) : collections.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2">Create a collection to start.</p>
            ) : (
              <ul className="space-y-1">
                {collections.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm font-heading transition-colors ${
                        selectedId === c.id ? "bg-primary/15 text-primary" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.chunkCount} chunks · {c.documentCount} docs
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Choose or create a collection</h3>
              <p className="text-muted-foreground text-sm">
                Upload .txt, .md, or .pdf files. Chunks are embedded with OpenAI (add your key in Settings) and stored under{" "}
                <code className="text-xs bg-muted/50 px-1 rounded">data/knowledge.json</code> on the server.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border/40 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading font-semibold truncate">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.chunkCount} chunks · {selected.documentCount} documents
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,text/plain,application/pdf"
                  className="hidden"
                  onChange={onFile}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-transparent"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload file
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive gap-1.5"
                  onClick={() => handleDelete(selected.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>

              <div className="px-4 py-3 border-b border-border/40 bg-card/20 shrink-0">
                <p className="text-xs text-muted-foreground mb-2 font-heading">Semantic search</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runQuery()}
                      placeholder="Ask something about your documents…"
                      className="pl-9 h-9 bg-input/30 border-border/40 font-heading text-sm"
                    />
                  </div>
                  <Button size="sm" className="h-9" onClick={runQuery} disabled={searching || !query.trim()}>
                    {searching ? "Searching…" : "Search"}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {hits === null ? (
                  <p className="text-sm text-muted-foreground">Run a search to see matching chunks.</p>
                ) : hits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No chunks scored above this query.</p>
                ) : (
                  <ul className="space-y-3 max-w-3xl">
                    {hits.map((h, i) => (
                      <li
                        key={`${h.docName}-${i}`}
                        className="rounded-xl border border-border/40 bg-card/40 p-4 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-heading text-xs text-primary">{h.docName}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {(h.score * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{h.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

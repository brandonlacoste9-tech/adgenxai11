/* ═══════════════════════════════════════════════════════
   Image generation — OpenAI Images (DALL·E 3) via server proxy
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Wand2, Sparkles, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { generateImage } from "@/lib/studio-client";
import { nanoid } from "nanoid";

type SizeOpt = "1024x1024" | "1792x1024" | "1024x1792";

interface GeneratedItem {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  b64: string;
  at: string;
}

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<SizeOpt>("1024x1024");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<GeneratedItem[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const out = await generateImage(prompt.trim(), size);
      setItems((prev) => [
        {
          id: nanoid(),
          prompt: prompt.trim(),
          revisedPrompt: out.revisedPrompt,
          b64: out.b64Json,
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast.success("Image generated");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Image Generation</h1>
          <Badge variant="outline" className="text-xs font-heading text-muted-foreground">
            <Grid3X3 className="h-3 w-3 mr-1" /> OpenAI Images
          </Badge>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border/40 bg-card/30 shrink-0">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Describe an image…"
            className="flex-1 min-w-[200px] h-10 bg-input/30 border-border/40 font-heading text-sm"
          />
          <Select value={size} onValueChange={(v) => setSize(v as SizeOpt)}>
            <SelectTrigger className="w-[140px] h-10 text-xs bg-input/30 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024 × 1024</SelectItem>
              <SelectItem value="1792x1024">1792 × 1024</SelectItem>
              <SelectItem value="1024x1792">1024 × 1792</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || busy}
            className="gap-1.5 font-heading text-sm h-10"
          >
            <Wand2 className="h-4 w-4" /> {busy ? "Generating…" : "Generate"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Requires an OpenAI API key in Settings (or OPENAI_API_KEY on the server). Costs follow OpenAI image pricing.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground text-sm">
              Generated images appear here for this session. They are not stored on the server unless you add storage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
            {items.map((it) => (
              <figure
                key={it.id}
                className="rounded-xl border border-border/40 bg-card/40 overflow-hidden flex flex-col"
              >
                <img
                  src={`data:image/png;base64,${it.b64}`}
                  alt={it.prompt}
                  className="w-full aspect-square object-cover bg-muted/20"
                />
                <figcaption className="p-3 text-xs space-y-1">
                  <p className="font-heading text-foreground line-clamp-2">{it.prompt}</p>
                  {it.revisedPrompt && it.revisedPrompt !== it.prompt && (
                    <p className="text-muted-foreground line-clamp-3">Revised: {it.revisedPrompt}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

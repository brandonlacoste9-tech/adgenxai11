/* ═══════════════════════════════════════════════════════
   Image Generation — AdGenXAI Amber Atelier
   Generate images with DALL-E 3 / Stable Diffusion.
   Gallery view with download and share.
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ImageIcon,
  Wand2,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Grid3X3,
} from "lucide-react";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  model: string;
  size: string;
  createdAt: Date;
}

const SAMPLE_IMAGES: GeneratedImage[] = [
  {
    id: "1",
    prompt: "A futuristic city at sunset with amber-gold lighting, cyberpunk aesthetic",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=512&h=512&fit=crop",
    model: "DALL-E 3",
    size: "1024x1024",
    createdAt: new Date(),
  },
  {
    id: "2",
    prompt: "Abstract geometric patterns in warm amber and dark leather tones",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=512&h=512&fit=crop",
    model: "Stable Diffusion XL",
    size: "1024x1024",
    createdAt: new Date(),
  },
  {
    id: "3",
    prompt: "A minimalist workspace with warm lighting and leather accents",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=512&h=512&fit=crop",
    model: "DALL-E 3",
    size: "1024x1024",
    createdAt: new Date(),
  },
  {
    id: "4",
    prompt: "Mountain landscape at golden hour with dramatic clouds",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
    model: "Stable Diffusion XL",
    size: "1024x1024",
    createdAt: new Date(),
  },
];

export default function ImagesPage() {
  const [images, setImages] = useState(SAMPLE_IMAGES);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("dalle-3");
  const [size, setSize] = useState("1024x1024");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    toast.info("Generating image... (10 credits)");
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: String(Date.now()),
        prompt: prompt.trim(),
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&fit=crop",
        model: model === "dalle-3" ? "DALL-E 3" : "Stable Diffusion XL",
        size,
        createdAt: new Date(),
      };
      setImages((prev) => [newImage, ...prev]);
      setPrompt("");
      setIsGenerating(false);
      toast.success("Image generated!");
    }, 2500);
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Image Generation</h1>
          <Badge variant="secondary" className="text-xs font-heading">
            <Grid3X3 className="h-3 w-3 mr-1" /> Gallery
          </Badge>
        </div>
        <Badge variant="secondary" className="font-heading text-xs">
          <Sparkles className="h-3 w-3 mr-1 text-primary" /> 10 credits per image
        </Badge>
      </div>

      {/* Prompt bar */}
      <div className="px-4 py-3 border-b border-border/40 bg-card/30">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Describe the image you want to create..."
            className="flex-1 h-10 bg-input/30 border-border/40 font-heading text-sm"
            disabled={isGenerating}
          />
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-44 h-10 bg-input/30 border-border/40 font-heading text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dalle-3">DALL-E 3</SelectItem>
              <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
            </SelectContent>
          </Select>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="w-32 h-10 bg-input/30 border-border/40 font-heading text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024x1024</SelectItem>
              <SelectItem value="1792x1024">1792x1024</SelectItem>
              <SelectItem value="1024x1792">1024x1792</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="gap-1.5 font-heading text-sm h-10">
            {isGenerating ? (
              <><RotateCcw className="h-4 w-4 animate-spin" /> Generating</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Generate</>
            )}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <ScrollArea className="flex-1 p-4">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Describe what you want to create and we'll generate it for you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-border/40 bg-card/60 hover:border-primary/30 transition-all">
                <div className="aspect-square">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs line-clamp-2 mb-2">{img.prompt}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] bg-white/10 text-white border-0">{img.model}</Badge>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => toast.info("Feature coming soon")}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleDelete(img.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

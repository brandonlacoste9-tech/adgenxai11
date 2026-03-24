/* ═══════════════════════════════════════════════════════
   NullClaw — edge / Zig runtime not integrated; shell only.
   ═══════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Binary, Shield } from "lucide-react";
import { toast } from "sonner";

export default function NullClawPage() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Binary className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">NullClaw</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 text-muted-foreground">
                Not connected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Boot sequences and edge nodes were simulated in the UI.</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-xs"
          onClick={() => toast.info("No NullClaw binary or edge service is attached to this deployment.")}
        >
          Download
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Card className="max-w-xl mx-auto p-6 border-border/40 bg-card/60">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm">No edge workload</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WASM tasks, SQLite memory, and fake latency numbers have been removed. This page is a placeholder until you
            plug in a real lightweight runtime or edge worker.
          </p>
        </Card>
      </ScrollArea>
    </div>
  );
}

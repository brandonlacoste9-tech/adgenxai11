/* ═══════════════════════════════════════════════════════
   NanoClaw — container runtime not integrated; shell only.
   ═══════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Container, Shield } from "lucide-react";
import { toast } from "sonner";

export default function NanoClawPage() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Container className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-bold">NanoClaw</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 text-muted-foreground">
                Not connected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Docker / swarm metrics here were illustrative only.</p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={() => toast.info("No container orchestration API is configured for this app.")}
        >
          New container
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Card className="max-w-xl mx-auto p-6 border-border/40 bg-card/60">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm">Empty runtime</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Swarm agents, logs, and CPU/memory figures were mock data. Connect Docker, Kubernetes, or another scheduler
            and drive this page from real APIs when you are ready.
          </p>
        </Card>
      </ScrollArea>
    </div>
  );
}

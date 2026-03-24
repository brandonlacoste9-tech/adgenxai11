/* ═══════════════════════════════════════════════════════
   Billing — no payment or metering backend in this repo.
   ═══════════════════════════════════════════════════════ */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Billing & Credits</h1>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-2xl">
        <Card className="border-border/40 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-heading">Not configured</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Credit balances, usage breakdowns, plan tiers, and invoice history that used to appear here were static
              demo content. This app does not include Stripe, a database, or server-side metering.
            </p>
            <p>When you add a real billing provider, replace this page with live data from your backend.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

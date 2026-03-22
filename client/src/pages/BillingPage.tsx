/* ═══════════════════════════════════════════════════════
   Billing — AdGenXAI Amber Atelier
   Credit usage, plan management, upgrade flow.
   ═══════════════════════════════════════════════════════ */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Sparkles,
  Check,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  MessageSquare,
  Code2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const usageData = [
  { label: "Chat Messages", icon: MessageSquare, used: 32, total: 50, cost: "1 credit each" },
  { label: "Code Generations", icon: Code2, used: 3, total: 10, cost: "5 credits each" },
  { label: "Image Generations", icon: ImageIcon, used: 0, total: 5, cost: "10 credits each" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: 50,
    current: true,
    features: ["5 AI models", "Chat Studio", "Code Builder (basic)", "1 Knowledge Base", "Community agents"],
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    credits: 500,
    current: false,
    highlighted: true,
    features: ["All AI models", "Unlimited chat history", "Code Builder + deploy", "5 Knowledge Bases", "Custom agents", "Image generation", "Priority support"],
  },
  {
    name: "Studio",
    price: "$50",
    period: "/month",
    credits: 2000,
    current: false,
    features: ["Everything in Pro", "Unlimited Knowledge Bases", "Advanced RAG pipeline", "Agent marketplace", "API access", "Team collaboration"],
  },
  {
    name: "Enterprise",
    price: "$100",
    period: "/month",
    credits: 5000,
    current: false,
    features: ["Everything in Studio", "White-label branding", "Unlimited team seats", "Custom model fine-tuning", "SLA guarantee", "Dedicated account manager", "Pay-as-you-go top-ups"],
  },
];

const history = [
  { date: "Today", action: "Chat with GPT-4.1", credits: -1 },
  { date: "Today", action: "Chat with Claude 3.5", credits: -1 },
  { date: "Today", action: "Code generation", credits: -5 },
  { date: "Yesterday", action: "Chat with DeepSeek R1", credits: -1 },
  { date: "Yesterday", action: "Chat with GPT-4.1", credits: -1 },
  { date: "2 days ago", action: "Account created", credits: 50 },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Billing & Credits</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 max-w-5xl">
        {/* Credit overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40 bg-card/60 md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-heading">Credit Balance</CardTitle>
                <Badge variant="secondary" className="font-heading text-xs">Free Plan</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-heading font-bold text-primary">42</span>
                <span className="text-muted-foreground text-sm mb-1.5">/ 50 credits</span>
              </div>
              <Progress value={84} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">Resets in 28 days</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Credits Used
                </span>
                <span className="text-sm font-heading font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Sessions
                </span>
                <span className="text-sm font-heading font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Avg/Day
                </span>
                <span className="text-sm font-heading font-semibold">2.7</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage breakdown */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageData.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-heading">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.used} / {item.total} ({item.cost})</span>
                  </div>
                  <Progress value={(item.used / item.total) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="font-heading font-semibold mb-4">Upgrade Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card key={plan.name} className={`border-border/40 bg-card/60 ${plan.highlighted ? "border-primary/50 shadow-lg shadow-primary/10" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-heading">{plan.name}</CardTitle>
                    {plan.current && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-heading font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="text-primary font-heading font-medium text-xs mt-1">
                    {plan.credits.toLocaleString()} credits/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full font-heading text-xs ${plan.current ? "" : plan.highlighted ? "" : "bg-transparent"}`}
                    variant={plan.current ? "secondary" : plan.highlighted ? "default" : "outline"}
                    disabled={plan.current}
                    onClick={() => toast.info("Feature coming soon")}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Buy Credits — Pay As You Go */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-heading">Buy More Credits</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-heading">Pay As You Go</Badge>
            </div>
            <CardDescription className="text-xs">
              Run out of credits? Buy packs anytime. No subscription required. Credits never expire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => toast.info("Feature coming soon")}
                className="group rounded-xl border border-border/40 bg-muted/20 p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <p className="text-2xl font-heading font-bold text-primary">100</p>
                <p className="text-xs text-muted-foreground mb-2">credits</p>
                <p className="text-lg font-heading font-semibold">$5</p>
                <p className="text-[10px] text-muted-foreground">$0.05 per credit</p>
              </button>
              <button
                onClick={() => toast.info("Feature coming soon")}
                className="group rounded-xl border border-primary/40 bg-primary/5 p-4 text-left hover:bg-primary/10 transition-all relative"
              >
                <Badge className="absolute -top-2 right-3 text-[10px] bg-primary text-primary-foreground">Best Value</Badge>
                <p className="text-2xl font-heading font-bold text-primary">500</p>
                <p className="text-xs text-muted-foreground mb-2">credits</p>
                <p className="text-lg font-heading font-semibold">$20</p>
                <p className="text-[10px] text-muted-foreground">$0.04 per credit</p>
              </button>
              <button
                onClick={() => toast.info("Feature coming soon")}
                className="group rounded-xl border border-border/40 bg-muted/20 p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <p className="text-2xl font-heading font-bold text-primary">2,000</p>
                <p className="text-xs text-muted-foreground mb-2">credits</p>
                <p className="text-lg font-heading font-semibold">$60</p>
                <p className="text-[10px] text-muted-foreground">$0.03 per credit</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-sm">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className={`text-sm font-heading font-semibold ${item.credits > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                    {item.credits > 0 ? "+" : ""}{item.credits}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

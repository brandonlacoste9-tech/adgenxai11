/* ═══════════════════════════════════════════════════════
   Landing Page — AdGenXAI "Amber Atelier"
   Hero with floating dashboard, features grid,
   pricing tiers, CTA, footer.
   ═══════════════════════════════════════════════════════ */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  Code2,
  Bot,
  BookOpen,
  ImageIcon,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Eye,
  Container,
  Binary,
  Play,
  ExternalLink,
} from "lucide-react";

const HERO_DASHBOARD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/hero-dashboard-TsoYHxf2xKniQBPLEh7nr9.webp";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/hero-bg-abstract-6LFD7JyW3a8SZeAYEVwsza.webp";
const FEATURE_CHAT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-chat-83qHvtBnT2SkGibWjGguA4.webp";
const FEATURE_CODE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-code-oUJRYGB5MXMaAYEVLgdU7o.webp";
const FEATURE_AGENTS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-agents-LCmPKuCVvKn3ZVAwMq4VDu.webp";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Studio",
    description: "Stream conversations with GPT-4.1, Claude, DeepSeek, Moonshot, and Ollama. Markdown rendering, code blocks, thinking sections, and vision support.",
    image: FEATURE_CHAT,
  },
  {
    icon: Code2,
    title: "Code Builder",
    description: "Generate full React + Tailwind components from prompts or screenshots. Live preview and one-click deploy.",
    image: FEATURE_CODE,
  },
  {
    icon: Bot,
    title: "OpenClaw",
    description: "Build custom AI agents with system prompts, model selection, and built-in tools. Browse the agent marketplace or create your own.",
    image: FEATURE_AGENTS,
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Upload PDFs and documents, chunk and embed them, then chat with your knowledge. Full RAG pipeline with multiple knowledge bases.",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description: "Create stunning images with DALL-E 3 and Stable Diffusion. Gallery view, download, and share your AI-generated artwork.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Full internationalization with English, French, Spanish, and Portuguese. Your AI Studio speaks your language.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "50 credits/month",
    features: ["5 AI models", "Chat Studio", "Code Builder (basic)", "1 Knowledge Base", "Community agents"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    credits: "500 credits/month",
    features: ["All AI models", "Unlimited chat history", "Code Builder + deploy", "5 Knowledge Bases", "Custom agents", "Image generation", "Priority support"],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$50",
    period: "/month",
    credits: "2,000 credits/month",
    features: ["Everything in Pro", "Unlimited Knowledge Bases", "Advanced RAG pipeline", "Agent marketplace", "API access", "Team collaboration", "Dedicated support"],
    cta: "Go Studio",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$100",
    period: "/month",
    credits: "5,000 credits/month",
    features: ["Everything in Studio", "White-label branding", "Unlimited team seats", "Custom model fine-tuning", "SLA guarantee", "Dedicated account manager", "Pay-as-you-go top-ups"],
    cta: "Go Enterprise",
    highlighted: false,
  },
];

const providers = [
  { name: "OpenAI", models: "GPT-4.1" },
  { name: "Anthropic", models: "Claude 3.5" },
  { name: "DeepSeek", models: "R1 Reasoner" },
  { name: "Moonshot", models: "Kimi 128K" },
  { name: "Ollama", models: "Local Models" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-primary">
                AdGenXAI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#providers" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Providers</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-heading">Sign In</Button>
              </Link>
              <Link href="/chat">
                <Button size="sm" className="font-heading gap-1.5">
                  Try Free <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left — Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-heading border-primary/20">
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-primary" /> 50 free credits — no sign-up required
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6 leading-[1.1]">
                <span className="text-foreground">Your AI.</span>{" "}
                <span className="text-primary">Your Studio.</span>
                <br />
                <span className="text-foreground">Your Rules.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Build apps and websites you can actually see. Chat with GPT-4.1, Claude, DeepSeek, and more. Generate code, deploy agents with OpenClaw, and create images — all from one premium AI studio.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/chat">
                  <Button size="lg" className="text-base px-8 font-heading gap-2">
                    Start Building Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 font-heading bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" /> API keys stay local
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" /> Live preview
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-primary" /> 50 free credits
                </span>
              </motion.div>
            </motion.div>

            {/* Right — Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative animate-float">
                <div className="absolute -inset-4 bg-primary/8 rounded-2xl blur-2xl" />
                <img
                  src={HERO_DASHBOARD}
                  alt="AdGenXAI Dashboard"
                  className="relative rounded-xl border border-border/40 shadow-2xl shadow-primary/10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brass divider */}
      <div className="brass-line max-w-5xl mx-auto my-8" />

      {/* Providers bar */}
      <section id="providers" className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground font-heading mb-8 uppercase tracking-widest">
            Powered by 5 AI Providers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {providers.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1.5 group">
                <span className="text-sm font-heading font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                  {p.name}
                </span>
                <span className="text-xs text-muted-foreground">{p.models}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl mb-4">
              Everything you need in{" "}
              <span className="text-primary">one studio</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              From chat to code generation, agent building to knowledge management — AdGenXAI is your complete AI workspace.
            </p>
          </motion.div>

          {/* Top 3 features with images */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {features.slice(0, 3).map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-350 group h-full overflow-hidden">
                  {feature.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    </div>
                  )}
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-heading">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom 3 features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.slice(3).map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
              >
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-350 group h-full">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-heading">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Claw Ecosystem */}
      <section id="ecosystem" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20">
              The Claw Ecosystem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Three runtimes.<br />One platform.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From cloud-scale agent swarms to 678KB edge binaries — AdGenXAI gives you the right runtime for every task.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: "OpenClaw",
                tagline: "Full-featured agent marketplace",
                desc: "300+ specialized agents. Multi-model support. Build, test, and deploy agents with a full studio UI. The brain of your workflow.",
                icon: Bot,
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                border: "border-amber-400/20",
                badge: "Flagship",
                badgeColor: "bg-amber-400/10 text-amber-400 border-amber-400/20",
                href: "/agents",
              },
              {
                name: "NanoClaw",
                tagline: "Secure containerized runtime",
                desc: "Each agent runs in its own Docker container. Zero-trust execution, network isolation, Agent Swarms for parallel task coordination.",
                icon: Container,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                border: "border-blue-400/20",
                badge: "Secure",
                badgeColor: "bg-blue-400/10 text-blue-400 border-blue-400/20",
                href: "/nanoclaw",
              },
              {
                name: "NullClaw",
                tagline: "Ultra-edge agent binary",
                desc: "678KB Zig-compiled binary. Boots in 2ms. Runs on 1MB RAM. WASM-compatible for client-side execution. Sovereign, offline-capable.",
                icon: Binary,
                color: "text-violet-400",
                bg: "bg-violet-400/10",
                border: "border-violet-400/20",
                badge: "Edge",
                badgeColor: "bg-violet-400/10 text-violet-400 border-violet-400/20",
                href: "/nullclaw",
              },
            ].map((runtime, i) => (
              <motion.div
                key={runtime.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full border ${runtime.border} bg-card/60 hover:bg-card/90 transition-all duration-300 group`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${runtime.bg} flex items-center justify-center`}>
                        <runtime.icon className={`h-6 w-6 ${runtime.color}`} />
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-2 ${runtime.badgeColor}`}>{runtime.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl font-display">{runtime.name}</CardTitle>
                    <p className={`text-xs font-medium ${runtime.color}`}>{runtime.tagline}</p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">{runtime.desc}</CardDescription>
                    <Link href={runtime.href}>
                      <Button variant="ghost" size="sm" className={`text-xs gap-1.5 h-8 ${runtime.color} hover:bg-current/10 px-2`}>
                        Explore {runtime.name} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Task Runner CTA + OpenManus badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">One-Button Task Runner</h3>
                <p className="text-sm text-muted-foreground">Enter any task. Hit Run. Watch the agent plan, use tools, and deliver results — live.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/40">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Powered by</span>
                <span className="text-xs font-semibold">OpenManus</span>
              </div>
              <Link href="/tasks">
                <Button size="sm" className="gap-2 text-sm">
                  <Play className="h-4 w-4" />
                  Try Task Runner
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl mb-4">
              Simple, <span className="text-primary">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className={`relative border-border/40 bg-card/60 backdrop-blur-sm h-full ${tier.highlighted ? "border-primary/50 shadow-lg shadow-primary/10 md:scale-105" : ""}`}>
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 font-heading">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading">{tier.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-4xl font-heading font-bold">{tier.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">{tier.period}</span>
                    </div>
                    <CardDescription className="mt-2 text-primary font-heading font-medium">{tier.credits}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={tier.name === "Free" ? "/chat" : `/register?plan=${tier.name.toLowerCase()}`}>
                      <Button
                        className={`w-full font-heading ${tier.highlighted ? "" : "bg-transparent"}`}
                        variant={tier.highlighted ? "default" : "outline"}
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 max-w-6xl">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-semibold text-lg mb-1">Need more credits?</h3>
                <p className="text-sm text-muted-foreground">Buy credit packs anytime. No subscription required. Credits never expire.</p>
              </div>
              <div className="flex gap-3 shrink-0 flex-wrap">
                <Badge variant="secondary" className="font-heading text-sm px-3 py-1.5">100 credits — $5</Badge>
                <Badge variant="secondary" className="font-heading text-sm px-3 py-1.5">500 credits — $20</Badge>
                <Badge variant="secondary" className="font-heading text-sm px-3 py-1.5">2,000 credits — $60</Badge>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Credit costs: Chat = 1 credit | Code Generation = 5 credits | Image Generation = 10 credits
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl mb-4">Ready to build with AI?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of developers and creators using AdGenXAI to supercharge their workflow.
            </p>
            <Link href="/chat">
              <Button size="lg" className="text-base px-8 font-heading gap-2">
                Start Free — No Sign-Up <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-heading font-bold text-primary">AdGenXAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AdGenXAI. Your AI. Your Studio. Your Rules.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Landing Page — AdGenXAI "Amber Atelier"
   Hero, features, workflow, BYOK pricing note, CTA, footer.
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
  ExternalLink,
} from "lucide-react";

const HERO_DASHBOARD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/hero-dashboard-TsoYHxf2xKniQBPLEh7nr9.webp";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/hero-bg-abstract-6LFD7JyW3a8SZeAYEVwsza.webp";
const FEATURE_CHAT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-chat-83qHvtBnT2SkGibWjGguA4.webp";
const FEATURE_CODE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-code-oUJRYGB5MXMaAYEVLgdU7o.webp";
const FEATURE_AGENTS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663288972865/Y5XK8CVAyhzapsgPW2KNGS/feature-agents-LCmPKuCVvKn3ZVAwMq4VDu.webp";

const features = [
  {
    icon: Code2,
    title: "Code Builder",
    description:
      "Describe a landing page, dashboard, or mini-app in plain language. The model returns HTML you preview live in the browser, then copy or download. Built for shipping real pages fast — wire your API keys in Settings.",
    image: FEATURE_CODE,
  },
  {
    icon: MessageSquare,
    title: "Chat Studio",
    description:
      "Talk to GPT-4-class, Claude, DeepSeek, Kimi, or local Ollama through one interface. Same models power chat and code: add keys once, iterate in markdown with code blocks.",
    image: FEATURE_CHAT,
  },
  {
    icon: Bot,
    title: "Agents",
    description:
      "Create agents with your own system prompts and models, test them in the wizard, and use them to steer Code Builder. No fake marketplace — you own the definitions.",
    image: FEATURE_AGENTS,
  },
  {
    icon: BookOpen,
    title: "Knowledge & RAG",
    description:
      "Room for document upload, chunking, and vector search when you connect a backend. The UI is ready to grow into a full knowledge workflow for site and app content.",
  },
  {
    icon: ImageIcon,
    title: "Images & media",
    description:
      "Hook up DALL·E, SDXL, or another image API when you need hero art, icons, or marketing visuals alongside your builds.",
  },
  {
    icon: Globe,
    title: "Your stack, your keys",
    description:
      "Bring-your-own-key: nothing is billed through AdGenXAI. Keys stay in your browser; requests proxy through your dev server or host so you stay in control.",
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
              <a href="#workflow" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
              <a href="#pricing" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#providers" className="text-sm font-heading text-muted-foreground hover:text-foreground transition-colors">Models</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-heading">Sign In</Button>
              </Link>
              <Link href="/code">
                <Button size="sm" className="font-heading gap-1.5">
                  Build <ArrowRight className="h-3.5 w-3.5" />
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
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI studio for websites & apps
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6 leading-[1.1]">
                <span className="text-foreground">Ship sites and</span>{" "}
                <span className="text-primary">apps</span>
                <br />
                <span className="text-foreground">from conversation.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Prompt → working HTML with a live preview. Chat with frontier models for specs, copy, and debugging. Custom agents keep your stack consistent. You bring the API keys; the studio keeps you in flow.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row flex-wrap items-start gap-3">
                <Link href="/code">
                  <Button size="lg" className="text-base px-8 font-heading gap-2">
                    Open Code Builder <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button size="lg" variant="outline" className="text-base px-8 font-heading bg-transparent">
                    Open Chat
                  </Button>
                </Link>
                <Link href="/sites">
                  <Button size="lg" variant="outline" className="text-base px-8 font-heading bg-transparent gap-2">
                    <Globe className="h-5 w-5" /> Sites &amp; GitHub
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" /> Live HTML preview
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" /> Keys in your browser
                </span>
                <span className="flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-primary" /> Export &amp; host anywhere
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
            Models you can wire up
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
              One studio to{" "}
              <span className="text-primary">design &amp; build</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Go from idea to previewable UI without leaving the browser. Chat for reasoning, Code Builder for pages and prototypes, agents for repeatable style — then plug in storage, billing, and image APIs when you need them.
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

      {/* Workflow — how you build */}
      <section id="workflow" className="py-24 px-4 relative overflow-hidden">
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
              How building works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              From prompt to <span className="text-primary">preview</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use the studio for the creative loop: clarify the product in chat, generate pages in Code Builder, refine with the same models. Deploy the HTML anywhere — or swap in React later in your own repo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: "1",
                title: "Shape the product",
                desc: "Chat Studio is for requirements, UX copy, edge cases, and debugging ideas before you lock layout.",
                icon: MessageSquare,
                href: "/chat",
                cta: "Open chat",
              },
              {
                step: "2",
                title: "Generate the UI",
                desc: "Code Builder asks the model for a full HTML document, shows it in a sandboxed preview, and lets you download or paste into your stack.",
                icon: Code2,
                href: "/code",
                cta: "Open builder",
              },
              {
                step: "3",
                title: "Repeat with agents",
                desc: "Save system prompts as agents so every page matches your brand voice, stack rules, and accessibility standards.",
                icon: Bot,
                href: "/agents",
                cta: "Build agents",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/40 bg-card/60 hover:border-primary/25 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-display font-bold text-primary/80">{item.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-display">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">{item.desc}</CardDescription>
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-primary hover:bg-primary/10 px-2">
                        {item.cta} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-border/40 bg-muted/20"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg mb-1">More automation later</h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Task runner, container runtimes, and edge workers are placeholders until you connect frameworks like OpenManus or your own job queue. The core studio already helps you ship static sites and app shells today.
                </p>
              </div>
              <Link href="/tasks">
                <Button size="sm" variant="outline" className="gap-2 text-sm shrink-0 bg-transparent">
                  View task runner <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing — honest BYOK */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-4xl sm:text-5xl mb-4">
              You pay <span className="text-primary">your providers</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              AdGenXAI is an open studio: run it locally or on your own host. There is no in-app billing, credit packs, or subscription here — only whatever your API keys cost at OpenAI, Anthropic, and the rest.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading">What that means in practice</CardTitle>
                <CardDescription>
                  Add keys in Settings once. Chat and Code Builder call your chosen models through the dev proxy; usage shows up on your provider dashboards, not ours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "No fake plans or credit meters in this app",
                  "Export HTML and host anywhere; extend the repo when you need React or a backend",
                  "Self-host the Express + Vite stack if you want keys off your laptop",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{line}</span>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/code" className="flex-1">
                    <Button className="w-full font-heading gap-2">
                      Start in Code Builder <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/chat" className="flex-1">
                    <Button variant="outline" className="w-full font-heading bg-transparent">
                      Open chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            <h2 className="font-display text-4xl sm:text-5xl mb-4">Ship your next page or app shell</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Use the studio to iterate from conversation to live HTML preview, then take the output into your deployment pipeline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/code">
                <Button size="lg" className="text-base px-8 font-heading gap-2 w-full sm:w-auto">
                  Open Code Builder <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline" className="text-base px-8 font-heading w-full sm:w-auto bg-transparent">
                  Chat first
                </Button>
              </Link>
            </div>
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
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} AdGenXAI — AI studio for websites and apps. Your keys, your stack.
          </p>
        </div>
      </footer>
    </div>
  );
}

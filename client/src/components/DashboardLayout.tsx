/* ═══════════════════════════════════════════════════════
   DashboardLayout — AdGenXAI Amber Atelier
   Persistent sidebar + main content area.
   Collapsible, responsive, warm leather aesthetic.
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MessageSquare,
  Code2,
  Bot,
  BookOpen,
  ImageIcon,
  CreditCard,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Sparkles,
  Container,
  Binary,
  Zap,
} from "lucide-react";

const navGroups = [
  {
    label: "Studio",
    items: [
      { href: "/chat", icon: MessageSquare, label: "Chat Studio" },
      { href: "/code", icon: Code2, label: "Code Builder" },
      { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
      { href: "/images", icon: ImageIcon, label: "Image Gen" },
    ],
  },
  {
    label: "Claw Ecosystem",
    items: [
      { href: "/agents", icon: Bot, label: "OpenClaw", accent: "text-amber-400" },
      { href: "/nanoclaw", icon: Container, label: "NanoClaw", accent: "text-blue-400" },
      { href: "/nullclaw", icon: Binary, label: "NullClaw", accent: "text-violet-400" },
      { href: "/tasks", icon: Zap, label: "Task Runner", accent: "text-primary" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/billing", icon: CreditCard, label: "Billing" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col
          border-r border-border/40 bg-sidebar
          transition-all duration-300 ease-out
          ${collapsed ? "w-[68px]" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-border/40">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-heading font-bold tracking-tight text-primary">
                AdGenXAI
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-7 w-7"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">{group.label}</p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.startsWith(item.href);
                    const accentColor = (item as { accent?: string }).accent;
                    const button = (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={`
                            w-full h-9 gap-3 transition-all duration-200
                            ${collapsed ? "justify-center px-0" : "justify-start"}
                            ${isActive
                              ? "bg-primary/12 text-primary hover:bg-primary/18 border-l-2 border-primary rounded-l-none"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            }
                          `}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : accentColor || ""}`} />
                          {!collapsed && (
                            <span className="text-sm font-medium">{item.label}</span>
                          )}
                        </Button>
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href} delayDuration={0}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent side="right" className="font-heading text-xs">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    return button;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <Separator className="opacity-30" />
        <div className="p-2">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">G</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Guest</p>
                <p className="text-xs text-muted-foreground truncate">50 credits</p>
              </div>
            )}
            {!collapsed && (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center h-14 px-4 border-b border-border/40 bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-primary">AdGenXAI</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

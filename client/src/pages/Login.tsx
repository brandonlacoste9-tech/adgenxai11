/* ═══════════════════════════════════════════════════════
   Login — AdGenXAI Amber Atelier
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back! Redirecting to your studio...");
    setTimeout(() => setLocation("/chat"), 800);
  };

  const handleGuest = () => {
    toast.info("Entering as guest — 50 free credits available");
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/40 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-4">
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
          <CardDescription>Sign in to your AdGenXAI studio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-heading text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-heading text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input/50"
              />
            </div>
            <Button type="submit" className="w-full font-heading gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button variant="outline" className="w-full font-heading bg-transparent" onClick={handleGuest}>
            Continue as Guest (50 free credits)
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

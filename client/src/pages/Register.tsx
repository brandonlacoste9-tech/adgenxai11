/* ═══════════════════════════════════════════════════════
   Register — AdGenXAI Amber Atelier
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Account created! Welcome to AdGenXAI.");
    setTimeout(() => setLocation("/chat"), 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/40 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-4">
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-heading">Create your studio</CardTitle>
          <CardDescription>Join AdGenXAI and start building with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-heading text-sm">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input/50"
              />
            </div>
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
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

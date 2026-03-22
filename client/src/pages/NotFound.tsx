import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">This page doesn't exist in the studio.</p>
        <Link href="/">
          <Button className="font-heading gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

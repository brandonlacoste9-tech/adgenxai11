/* ═══════════════════════════════════════════════════════
   Settings — AdGenXAI Amber Atelier
   API keys, model config, appearance, profile.
   ═══════════════════════════════════════════════════════ */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  Key,
  Palette,
  User,
  Globe,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const providers = [
    { name: "OpenAI", key: "sk-proj-••••••••••••••••", placeholder: "sk-proj-..." },
    { name: "Anthropic", key: "", placeholder: "sk-ant-..." },
    { name: "DeepSeek", key: "", placeholder: "sk-..." },
    { name: "Moonshot", key: "", placeholder: "sk-..." },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center h-14 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="md:w-52 border-b md:border-b-0 md:border-r border-border/40 p-3">
          <TabsList className="flex md:flex-col w-full bg-transparent gap-1">
            <TabsTrigger value="api-keys" className="justify-start gap-2 font-heading text-xs w-full">
              <Key className="h-3.5 w-3.5" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start gap-2 font-heading text-xs w-full">
              <Palette className="h-3.5 w-3.5" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="profile" className="justify-start gap-2 font-heading text-xs w-full">
              <User className="h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="language" className="justify-start gap-2 font-heading text-xs w-full">
              <Globe className="h-3.5 w-3.5" /> Language
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start gap-2 font-heading text-xs w-full">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-2xl">
            <TabsContent value="api-keys" className="mt-0 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">API Keys</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your API keys for each provider. Keys are stored locally and never sent to our servers.
                </p>
              </div>

              {providers.map((provider) => (
                <Card key={provider.name} className="border-border/40 bg-card/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {provider.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        type={showKeys[provider.name] ? "text" : "password"}
                        defaultValue={provider.key}
                        placeholder={provider.placeholder}
                        className="flex-1 bg-input/30 border-border/40 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent"
                        onClick={() => toggleKey(provider.name)}
                      >
                        {showKeys[provider.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-border/40 bg-card/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Ollama (Local)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-xs font-heading">Base URL</Label>
                    <Input
                      defaultValue="http://localhost:11434"
                      className="bg-input/30 border-border/40 font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button className="font-heading gap-2" onClick={() => toast.success("API keys saved!")}>
                <Save className="h-4 w-4" /> Save Keys
              </Button>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">Appearance</h2>
                <p className="text-sm text-muted-foreground mb-4">Customize the look and feel of your studio.</p>
              </div>

              <Card className="border-border/40 bg-card/60">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">Theme</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</p>
                    </div>
                    <Select defaultValue="dark">
                      <SelectTrigger className="w-32 bg-input/30 border-border/40 font-heading text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">Compact Mode</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing for more content</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">Code Font Size</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Adjust code block font size</p>
                    </div>
                    <Select defaultValue="14">
                      <SelectTrigger className="w-24 bg-input/30 border-border/40 font-heading text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12px</SelectItem>
                        <SelectItem value="14">14px</SelectItem>
                        <SelectItem value="16">16px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-0 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">Profile</h2>
                <p className="text-sm text-muted-foreground mb-4">Manage your account information.</p>
              </div>
              <Card className="border-border/40 bg-card/60">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Display Name</Label>
                    <Input defaultValue="Guest" className="bg-input/30 border-border/40" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Email</Label>
                    <Input placeholder="you@example.com" className="bg-input/30 border-border/40" />
                  </div>
                  <Button className="font-heading gap-2" onClick={() => toast.success("Profile saved!")}>
                    <Save className="h-4 w-4" /> Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="mt-0 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">Language</h2>
                <p className="text-sm text-muted-foreground mb-4">Set your preferred language.</p>
              </div>
              <Card className="border-border/40 bg-card/60">
                <CardContent className="pt-6">
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full bg-input/30 border-border/40 font-heading text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">Notifications</h2>
                <p className="text-sm text-muted-foreground mb-4">Control how you receive notifications.</p>
              </div>
              <Card className="border-border/40 bg-card/60">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">Credit Alerts</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Get notified when credits are low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">New Agent Releases</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Notifications for new OpenClaw agents</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-heading text-sm">Product Updates</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Feature announcements and updates</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AgentContext — AdGenXAI
   Shared context that persists the active OpenClaw agent
   across pages (Code Builder, Chat, etc.)
   ═══════════════════════════════════════════════════════ */

import { createContext, useContext, useState, ReactNode } from "react";

export interface ActiveAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  tools: string[];
  iconColor: string;
}

interface AgentContextValue {
  activeAgent: ActiveAgent | null;
  setActiveAgent: (agent: ActiveAgent | null) => void;
  installedAgents: ActiveAgent[];
  setInstalledAgents: (agents: ActiveAgent[]) => void;
}

const AgentContext = createContext<AgentContextValue>({
  activeAgent: null,
  setActiveAgent: () => {},
  installedAgents: [],
  setInstalledAgents: () => {},
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<ActiveAgent | null>(null);
  const [installedAgents, setInstalledAgents] = useState<ActiveAgent[]>([]);

  return (
    <AgentContext.Provider value={{ activeAgent, setActiveAgent, installedAgents, setInstalledAgents }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}

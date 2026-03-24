import { describe, expect, it } from "vitest";
import { composeSystemPrompt } from "../server/agents/agentFactory.ts";
import { getPromptBundleVersion, getSystemPrompt } from "../server/prompts/prompts.ts";

describe("versioned prompts", () => {
  it("exposes manifest version", async () => {
    const v = await getPromptBundleVersion();
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("loads chat job prompt from disk", async () => {
    const text = await getSystemPrompt("chat");
    expect(text).toContain("AdGenXAI");
    expect(text.length).toBeGreaterThan(40);
  });

  it("composes chat system with safety and extension", async () => {
    const composed = await composeSystemPrompt("chat", {
      extension: "Always sign replies as — Studio Bot",
    });
    expect(composed).toContain("AdGenXAI conversational assistant");
    expect(composed).toContain("Safety and policy");
    expect(composed).toContain("Studio Bot");
  });

  it("composes site system with validation and design notes", async () => {
    const composed = await composeSystemPrompt("site", {
      siteDesignNotes: "Brand: cobalt blue, no stock photo URLs.",
      extension: "Prefer short hero copy.",
    });
    expect(composed).toContain("Site Builder");
    expect(composed).toContain("Validation checklist");
    expect(composed).toContain("cobalt blue");
    expect(composed).toContain("Prefer short hero");
  });

  it("loads app job and injects file schema into composed system", async () => {
    const app = await getSystemPrompt("app");
    expect(app).toContain("App Builder");
    const composed = await composeSystemPrompt("app");
    expect(composed).toContain("JSON Schema");
    expect(composed).toContain("GeneratedProjectFile");
  });

  it("composes test job with shared file schema", async () => {
    const composed = await composeSystemPrompt("test");
    expect(composed).toContain("test generator");
    expect(composed).toContain("path");
  });

  it("loads design and deploy jobs", async () => {
    expect(await getSystemPrompt("design")).toContain("Design assistant");
    expect(await getSystemPrompt("deploy")).toContain("deploy/CI");
  });
});

/**
 * Shape checks for model output — extend with a stubbed provider when you add CI LLM calls.
 */
describe("prompt regression (offline)", () => {
  const scenarios = [
    {
      name: "site prompt forbids markdown fences in instructions",
      fn: async () => {
        const site = await getSystemPrompt("site");
        expect(site.toLowerCase()).toContain("markdown");
        expect(site).toMatch(/Do not wrap|no markdown|Markdown/i);
      },
    },
    {
      name: "chat prompt discourages unsolicited code",
      fn: async () => {
        const chat = await getSystemPrompt("chat");
        expect(chat).toMatch(/code|HTML|markup/i);
      },
    },
    {
      name: "app job requests JSON array output only",
      fn: async () => {
        const app = await getSystemPrompt("app");
        expect(app).toMatch(/JSON array|valid JSON/i);
        expect(app.toLowerCase()).toContain("markdown");
      },
    },
  ];

  for (const s of scenarios) {
    it(s.name, s.fn);
  }
});

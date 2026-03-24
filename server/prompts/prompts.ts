import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHAT_PROMPT_JOB_KEYS,
  type ChatPromptJob,
  isChatPromptJob,
} from "../../shared/chat-api.ts";

/** Alias for server code — same union as `ChatPromptJob`. */
export const PROMPT_JOB_KEYS = CHAT_PROMPT_JOB_KEYS;
export type PromptJob = ChatPromptJob;
export { isChatPromptJob as isPromptJob };

export interface PromptJobDefinition {
  promptPath: string;
  description: string;
  validationPath?: string;
  schemaPath?: string;
}

export interface PromptManifest {
  version: string;
  createdAt?: string;
  safetyPath?: string;
  jobs: Record<PromptJob, PromptJobDefinition>;
}

let manifestCache: PromptManifest | null = null;
const fileCache = new Map<string, string>();

function resolvePromptsDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  if (fs.existsSync(path.join(here, "manifest.json"))) {
    return here;
  }
  const distCopy = path.join(here, "prompts");
  if (fs.existsSync(path.join(distCopy, "manifest.json"))) {
    return distCopy;
  }
  const fromRepo = path.resolve(here, "..", "server", "prompts");
  if (fs.existsSync(path.join(fromRepo, "manifest.json"))) {
    return fromRepo;
  }
  throw new Error(`AdGenXAI prompts not found (searched from ${here})`);
}

async function readPromptFile(relativePath: string): Promise<string> {
  const root = resolvePromptsDir();
  const full = path.join(root, relativePath);
  const cached = fileCache.get(full);
  if (cached !== undefined) return cached;
  const text = await readFile(full, "utf-8");
  fileCache.set(full, text);
  return text;
}

export async function getManifest(): Promise<PromptManifest> {
  if (manifestCache) return manifestCache;
  const raw = await readPromptFile("manifest.json");
  manifestCache = JSON.parse(raw) as PromptManifest;
  return manifestCache;
}

export async function getSystemPrompt(job: PromptJob): Promise<string> {
  const m = await getManifest();
  const jobInfo = m.jobs[job];
  if (!jobInfo) throw new Error(`Unsupported prompt job: ${job}`);
  return readPromptFile(jobInfo.promptPath);
}

/** Validation / checklist text for jobs that define validationPath (e.g. site). */
export async function getValidationRulesForJob(job: PromptJob): Promise<string | null> {
  const m = await getManifest();
  const p = m.jobs[job]?.validationPath;
  if (!p) return null;
  return readPromptFile(p);
}

/** @deprecated Use getValidationRulesForJob("site") */
export async function getValidationRules(): Promise<string | null> {
  return getValidationRulesForJob("site");
}

/** Raw JSON Schema text for jobs that define schemaPath (e.g. app, test). */
export async function getSchemaTextForJob(job: PromptJob): Promise<string | null> {
  const m = await getManifest();
  const p = m.jobs[job]?.schemaPath;
  if (!p) return null;
  return readPromptFile(p);
}

export async function getSafetyBlock(): Promise<string | null> {
  const m = await getManifest();
  if (!m.safetyPath) return null;
  try {
    return (await readPromptFile(m.safetyPath)).trim() || null;
  } catch {
    return null;
  }
}

/** Manifest version for logs and tests. */
export async function getPromptBundleVersion(): Promise<string> {
  const m = await getManifest();
  return m.version;
}

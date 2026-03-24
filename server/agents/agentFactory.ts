import type { PromptJob } from "../prompts/prompts.ts";
import {
  getSafetyBlock,
  getSchemaTextForJob,
  getSystemPrompt,
  getValidationRulesForJob,
} from "../prompts/prompts.ts";

export type { PromptJob };

export interface ComposeSystemOptions {
  /** User or agent-defined overlay (appended after defaults). */
  extension?: string;
  /** Site-wide design brief for the `site` job only. */
  siteDesignNotes?: string;
}

/**
 * Builds the full system string for a prompt job: safety block, job prompt,
 * optional validation checklist, optional JSON Schema injection, then overlay.
 */
export async function composeSystemPrompt(job: PromptJob, options?: ComposeSystemOptions): Promise<string> {
  const parts: string[] = [];
  const safety = await getSafetyBlock();
  if (safety) parts.push(safety);
  parts.push((await getSystemPrompt(job)).trim());

  const rules = await getValidationRulesForJob(job);
  if (rules?.trim()) {
    parts.push(`Validation checklist:\n${rules.trim()}`);
  }

  const schema = await getSchemaTextForJob(job);
  if (schema?.trim()) {
    parts.push(`JSON Schema (per-file object in the output array):\n${schema.trim()}`);
  }

  if (job === "site" && options?.siteDesignNotes?.trim()) {
    parts.push(`Site-wide design brief (keep consistent across pages):\n${options.siteDesignNotes.trim()}`);
  }

  if (options?.extension?.trim()) {
    parts.push(`---\n${options.extension.trim()}`);
  }

  return parts.join("\n\n");
}

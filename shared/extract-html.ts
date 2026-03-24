/** Escape text for safe embedding in HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Pull a single HTML document from a model reply (fences or raw). */
export function extractHtmlDocument(reply: string): string {
  const trimmed = reply.trim();
  const fullFence = trimmed.match(/^```(?:html)?\s*([\s\S]*?)```/im);
  if (fullFence) return fullFence[1].trim();
  const inner = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (inner) return inner[1].trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return trimmed;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Output</title></head><body class="p-6"><pre>${escapeHtml(trimmed)}</pre></body></html>`;
}

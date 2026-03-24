import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "server", "prompts");
const dest = path.join(root, "dist", "prompts");

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const name of ["manifest.json", "safety.txt", "chat", "site", "app", "design", "test", "deploy"]) {
  fs.cpSync(path.join(src, name), path.join(dest, name), { recursive: true });
}

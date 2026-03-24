import fs from "node:fs";
import path from "node:path";
import type { TaskJobDto } from "../../shared/studio-api.ts";

const MAX_JOBS = 400;

function dataRoot(): string {
  return process.env.ADGEN_DATA_DIR || path.join(process.cwd(), "data");
}

function tasksPath(): string {
  return path.join(dataRoot(), "tasks.json");
}

function ensureDir(): void {
  const dir = path.dirname(tasksPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function hydrateJobs(map: Map<string, TaskJobDto>): void {
  const p = tasksPath();
  if (!fs.existsSync(p)) return;
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const j = JSON.parse(raw) as { jobs?: TaskJobDto[] };
    for (const job of j.jobs ?? []) {
      if (job?.id && typeof job.id === "string") {
        map.set(job.id, {
          id: job.id,
          status: job.status,
          trace: Array.isArray(job.trace) ? job.trace : [],
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          task: typeof job.task === "string" ? job.task : undefined,
        });
      }
    }
  } catch {
    /* ignore corrupt file */
  }
}

export function saveJobs(map: Map<string, TaskJobDto>): void {
  ensureDir();
  const list = Array.from(map.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_JOBS);
  fs.writeFileSync(tasksPath(), JSON.stringify({ jobs: list }, null, 0), "utf-8");
}

export function listRecentJobs(map: Map<string, TaskJobDto>, limit: number): TaskJobDto[] {
  return Array.from(map.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.min(Math.max(limit, 1), 100));
}

import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { BuildSseEvent } from "../../shared/build-api.ts";

/**
 * Per-build event bus: in-memory history for SSE replay + live subscribers.
 */
export class BuildEventBus {
  private emitters = new Map<string, EventEmitter>();
  private history = new Map<string, BuildSseEvent[]>();

  initBuild(buildId: string): void {
    if (!this.emitters.has(buildId)) {
      this.emitters.set(buildId, new EventEmitter());
      this.history.set(buildId, []);
    }
  }

  hasBuild(buildId: string): boolean {
    return this.history.has(buildId);
  }

  publish(buildId: string, event: BuildSseEvent): void {
    const list = this.history.get(buildId);
    if (!list) return;
    list.push(event);
    this.emitters.get(buildId)?.emit("build", event);
  }

  /** Stream replay + live events (Express or Node HTTP). */
  attachSse(buildId: string, req: IncomingMessage, res: ServerResponse): void {
    const list = this.history.get(buildId);
    if (!list) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("unknown buildId");
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    const flush = (res as ServerResponse & { flushHeaders?: () => void }).flushHeaders;
    if (typeof flush === "function") flush.call(res);

    const writeEvent = (ev: BuildSseEvent) => {
      res.write(`event: ${ev.type}\n`);
      res.write(`data: ${JSON.stringify(ev.payload)}\n\n`);
    };

    for (const ev of list) {
      writeEvent(ev);
    }

    const emitter = this.emitters.get(buildId);
    if (!emitter) {
      res.end();
      return;
    }

    const onBuild = (ev: BuildSseEvent) => writeEvent(ev);
    emitter.on("build", onBuild);

    const ping = setInterval(() => {
      res.write(`: ping\n\n`);
    }, 25000);

    const cleanup = () => {
      clearInterval(ping);
      emitter.off("build", onBuild);
      try {
        res.end();
      } catch {
        /* ignore */
      }
    };

    req.on("close", cleanup);
    req.on("aborted", cleanup);
  }
}

export const buildEventBus = new BuildEventBus();

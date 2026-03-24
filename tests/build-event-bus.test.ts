import { describe, expect, it } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { BuildEventBus } from "../server/build/build-event-bus.ts";

describe("BuildEventBus", () => {
  it("replays history to new subscribers", () => {
    const bus = new BuildEventBus();
    const id = "test-replay";
    bus.initBuild(id);
    bus.publish(id, { type: "build_progress", payload: { percent: 10 } });
    bus.publish(id, { type: "build_done", payload: { ok: true } });

    const chunks: string[] = [];
    const res = {
      statusCode: 0,
      setHeader(_k: string, _v: string) {},
      write(s: string) {
        chunks.push(s);
      },
      end() {},
    } as unknown as ServerResponse;

    const req = { on: () => req } as unknown as IncomingMessage;

    bus.attachSse(id, req, res);

    const text = chunks.join("");
    expect(text).toContain("event: build_progress");
    expect(text).toContain('"percent":10');
    expect(text).toContain("event: build_done");
  });
});

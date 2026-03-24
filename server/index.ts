import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import type { ChatRequestBody } from "../shared/chat-api.ts";
import { runChat } from "./lib/chat-proxy.ts";
import studioRouter from "./routes/studio.ts";
import sitesRouter from "./routes/sites-router.ts";
import buildRouter from "./routes/build-router.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  app.use(express.json({ limit: "25mb" }));

  app.post("/api/chat", async (req, res) => {
    try {
      const result = await runChat(req.body as ChatRequestBody);
      if ("error" in result) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json({ content: result.content });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.use("/api", studioRouter);
  app.use("/api", sitesRouter);
  app.use("/api", buildRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

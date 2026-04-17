import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { runRealAgent } from "./src/backend/RealAgent.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup/Initialization Endpoint for the Terminal UI config
  app.post("/api/setup", async (req, res) => {
    const config = req.body;
    let envContent = "\n";
    for (const [key, val] of Object.entries(config)) {
      if (val) envContent += `${key}=${val}\n`;
    }
    
    try {
      await fs.appendFile(path.join(process.cwd(), '.env'), envContent);
      res.json({ success: true });
    } catch (e: any) {
      console.error("Failed to write to .env", e);
      res.status(500).json({ error: e.message });
    }
  });

  // SSE endpoint for live streaming ReAct loop
  app.post("/api/agent/stream", async (req, res) => {
    const { objective } = req.body;
    
    if (!objective) {
      return res.status(400).json({ error: "Missing objective" });
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    const sendEvent = (type: string, content: string) => {
      res.write(`data: ${JSON.stringify({ type, content, timestamp: Date.now() })}\n\n`);
    };

    try {
      sendEvent('system', `Starting genuine Agent Swarm for objective: "${objective}"`);
      
      await runRealAgent(objective, (type, text) => {
        sendEvent(type, text);
      });
      
      sendEvent('system', `Agent execution correctly finalized.`);
    } catch (e: any) {
      sendEvent('error', `Engine Failure: ${e.message}`);
    } finally {
      res.end();
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus API Server running on http://localhost:${PORT}`);
  });
}

startServer();

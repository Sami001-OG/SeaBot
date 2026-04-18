import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { runRealAgent } from "./src/backend/RealAgent.js";
import { VectorDB } from "./src/backend/VectorDB.js";
import { TelegramPoller } from "./src/backend/TelegramPoller.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatically start long-polling for Telegram (safe if token missing)
  TelegramPoller.start();

  // WhatsApp (Twilio) Webhook Integration Endpoint
  app.post("/api/webhook/twilio", express.urlencoded({ extended: true }), async (req, res) => {
    // Twilio hits this when a WhatsApp message arrives
    const incomingMsg = req.body.Body;
    const fromNum = req.body.From; // e.g. "whatsapp:+1234567890"

    // Respond immediately to prevent Twilio timeout (15s limit)
    res.set("Content-Type", "text/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>SeaBot acknowledged. Thinking...</Message></Response>`);

    // Run the agent in the background
    try {
      console.log(`[WhatsApp] Task Initiated: ${incomingMsg}`);
      const finalAnswer = await runRealAgent(incomingMsg, () => {}, 0, "gemini:gemini-3.1-pro");
      
      // Dispatch result using Twilio API
      const twilioSid = TelegramPoller.getEnv('TWILIO_ACCOUNT_SID');
      const twilioAuth = TelegramPoller.getEnv('TWILIO_AUTH_TOKEN');
      const twilioNumber = TelegramPoller.getEnv('TWILIO_WHATSAPP_NUMBER'); // e.g. "whatsapp:+14155238886"

      if (twilioSid && twilioAuth && twilioNumber) {
         const creds = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
         const params = new URLSearchParams();
         params.append('To', fromNum);
         params.append('From', twilioNumber);
         // Twilio API limits single messages to 1600 chars sometimes, truncate if massively long
         params.append('Body', `[SeaBot OS Completed]\n\n${finalAnswer.substring(0, 1500)}`);
         
         await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: { 
              'Authorization': `Basic ${creds}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
         });
      } else {
         console.error("[WhatsApp] Missing Twilio credentials in environment for backend reply.");
      }
    } catch (e: any) {
      console.error("[WhatsApp] Agent execution failed:", e.message);
    }
  });

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

  // Memory API: Get all vectors from LTM
  app.get("/api/memory", async (req, res) => {
    try {
      const vdb = new VectorDB();
      const entries = await vdb.getAll();
      res.json(entries);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Memory API: Manually store new memory
  app.post("/api/memory", async (req, res) => {
    try {
      const { content, tags } = req.body;
      const vdb = new VectorDB();
      await vdb.store(content, tags);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Workspace API: Direct Filesystem Access for Web UI
  app.get("/api/fs/list", async (req, res) => {
    try {
      const dirPath = req.query.path ? String(req.query.path) : process.cwd();
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const result = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.relative(process.cwd(), path.join(dirPath, item.name))
      }));
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/fs/read", async (req, res) => {
    try {
      const targetPath = path.resolve(process.cwd(), String(req.query.path || ''));
      if (!targetPath.startsWith(process.cwd())) throw new Error("Access Denied");
      const content = await fs.readFile(targetPath, 'utf8');
      res.json({ content });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/fs/write", async (req, res) => {
    try {
      const { targetPath, content } = req.body;
      const fullPath = path.resolve(process.cwd(), targetPath);
      if (!fullPath.startsWith(process.cwd())) throw new Error("Access Denied");
      await fs.writeFile(fullPath, content, 'utf8');
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // SSE endpoint for live streaming ReAct loop
  app.post("/api/agent/stream", async (req, res) => {
    const { objective, provider } = req.body;
    
    if (!objective) {
      return res.status(400).json({ error: "Missing objective" });
    }

    const finalProvider = provider || 'gemini'; // default fallback

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    const sendEvent = (type: string, content: string) => {
      res.write(`data: ${JSON.stringify({ type, content, timestamp: Date.now() })}\n\n`);
    };

    try {
      sendEvent('system', `Starting genuine Agent Swarm via [${finalProvider.toUpperCase()}] Gateway for objective: "${objective}"`);
      
      await runRealAgent(objective, (type, text) => {
        sendEvent(type, text);
      }, 0, finalProvider);
      
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

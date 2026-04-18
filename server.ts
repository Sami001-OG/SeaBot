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

  // Slack Events API Integration Endpoint
  app.post("/api/webhook/slack", async (req, res) => {
    const { type, challenge, event } = req.body;
    
    // Slack requires returning the challenge on endpoint setup
    if (type === "url_verification") {
      res.send(challenge);
      return;
    }

    // Acknowledge event immediately to prevent Slack 3-second timeout retry loops
    res.status(200).send("");

    if (event && event.type === "message" && !event.bot_id) {
       const incomingMsg = event.text;
       const channelId = event.channel;
       const slackToken = TelegramPoller.getEnv('SLACK_BOT_TOKEN');
       if (!slackToken) return;

       // Send thinking indicator (optional, but good for UX)
       fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: channelId, text: "_SeaBot is pondering your request..._" })
       }).catch(() => {});

       try {
          console.log(`[Slack] Task Initiated: ${incomingMsg}`);
          const finalAnswer = await runRealAgent(incomingMsg, () => {}, 0, "gemini:gemini-3.1-pro");
          
          // Post actual response
          await fetch('https://slack.com/api/chat.postMessage', {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/json' },
             body: JSON.stringify({ channel: channelId, text: finalAnswer })
          });
       } catch (e: any) {
          console.error("[Slack] Agent execution failed:", e.message);
       }
    }
  });

  // GitHub Webhook Integration (Responds to Issues or Comments natively)
  app.post("/api/webhook/github", async (req, res) => {
    const eventType = req.headers['x-github-event'];
    res.status(200).send("OK"); // Acknowledge early

    if (eventType === 'issues' || eventType === 'issue_comment') {
      const action = req.body.action;
      if (action === 'opened' || action === 'created') {
         const repoFullName = req.body.repository?.full_name;
         const issueNumber = req.body.issue?.number;
         const commentBody = req.body.comment ? req.body.comment.body : req.body.issue?.body;
         const sender = req.body.sender?.login;
         
         // Ignore our own bot to prevent continuous loop
         if (req.body.sender?.type === "Bot") return;

         const ghToken = TelegramPoller.getEnv('GITHUB_ACCESS_TOKEN');
         if (!ghToken) return;

         try {
            console.log(`[GitHub] Task Initiated from ${sender}: ${commentBody}`);
            // Provide codebase context prompt to agent
            const task = `GitHub Issue/Comment from ${sender}: "${commentBody}". Analyze the repository and provide a technical response or fix.`;
            const finalAnswer = await runRealAgent(task, () => {}, 0, "gemini:gemini-3.1-pro");
            
            await fetch(`https://api.github.com/repos/${repoFullName}/issues/${issueNumber}/comments`, {
               method: 'POST',
               headers: {
                 'Authorization': `Bearer ${ghToken}`,
                 'Accept': 'application/vnd.github.v3+json',
                 'User-Agent': 'SeaBot-OS'
               },
               body: JSON.stringify({ body: `**SeaBot Auto-Response:**\n\n${finalAnswer}` })
            });
         } catch (e: any) {
            console.error("[GitHub] Agent execution failed:", e.message);
         }
      }
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

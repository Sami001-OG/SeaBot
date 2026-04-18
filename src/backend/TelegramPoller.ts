import { runRealAgent } from "./RealAgent.js";
import fs from "fs";
import path from "path";

/**
 * Super lightweight Long-Polling Telegram Bot Integration for SeaBot.
 * This runs natively alongside the Express server, allowing users to
 * text the agent from their phone via Telegram.
 */
export class TelegramPoller {
  private static isRunning = false;
  private static lastUpdateId = 0;

  static getEnv(key: string): string | undefined {
    if (process.env[key]) return process.env[key];
    try {
      const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
      const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
      if (match && match[1]) return match[1].trim();
    } catch { }
    return undefined;
  }

  static async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[Telegram] Initializing SeaBot Poller...");
    this.poll();
  }

  private static async poll() {
    if (!this.isRunning) return;

    try {
      const token = this.getEnv('TELEGRAM_BOT_TOKEN');
      if (token) {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`);
        const data = await res.json();

        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            this.lastUpdateId = update.update_id;

            if (update.message && update.message.text) {
              const chatId = update.message.chat.id;
              const text = update.message.text;
              console.log(`[Telegram] Received Task: ${text}`);

              // Notify User we are thinking
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: "Wait... Let me think." })
              });

              // Run SeaBot Agent Backend (defaults to standard provider)
              const finalAnswer = await runRealAgent(text, (type, logText) => {
                 // We could technically stream thoughts to telegram if we wanted, 
                 // but for now we just keep it quiet and send the final answer.
                 console.log(`[Telegram-Agent] ${type}: ${logText.substring(0, 100)}`);
              }, 0, "gemini:gemini-3.1-pro"); 

              // Send the Final Answer back
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                   chat_id: chatId, 
                   text: `[SeaBot OS Completed]\n\n${finalAnswer}`,
                   parse_mode: 'Markdown'
                })
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.error("[Telegram] Polling error:", e.message);
    }

    // Loop
    setTimeout(() => this.poll(), 2000);
  }
}

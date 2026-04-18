import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

export type ModelProvider = string; // e.g., "openai:gpt-4o", "anthropic:claude-3-5-sonnet-20241022"

/**
 * ModelRouter
 * Real OpenClaw Gateway router mapping local API keys into cloud executions.
 * Now supports dynamic exact model targeting (provider:modelName) and keyless fallbacks.
 */
export class ModelRouter {
  
  // Dynamically load keys from .env if process.env is missing them due to runtime edits
  static getEnv(key: string): string | undefined {
     if (process.env[key]) return process.env[key];
     try {
       const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
       const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
       if (match && match[1]) return match[1].trim();
     } catch (e) {
       // Ignore if .env doesn't exist
     }
     return undefined;
  }

  static async fallbackToNative(prompt: string, reason: string): Promise<string> {
      console.warn(`[ModelRouter Fallback] ${reason} - Routing through native engine.`);
      
      const nativeKey = this.getEnv('GEMINI_API_KEY');
      if (!nativeKey) throw new Error("CRITICAL: Native environment GEMINI_API_KEY is missing. Completely disabled. Please add GEMINI_API_KEY to your .env file.");
      
      const ai = new GoogleGenAI({ apiKey: nativeKey });
      const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: prompt,
      });
      return response.text || "";
  }

  static async generate(providerString: string, prompt: string): Promise<string> {
    const parts = providerString.split(':');
    const prov = parts[0].toLowerCase();
    // Re-join the rest in case models have colons (e.g., OpenRouter paths)
    const exactModel = parts.slice(1).join(':'); 
    
    try {
      if (prov === 'openai') {
         const apiKey = this.getEnv('OPENAI_API_KEY');
         if (!apiKey) return await this.fallbackToNative(prompt, "Missing OPENAI_API_KEY");
         const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) return await this.fallbackToNative(prompt, `OpenAI Auth Failed: ${data.error.message || JSON.stringify(data.error)}`);
         return data.choices[0].message.content;
      }
      
      else if (prov === 'anthropic') {
         const apiKey = this.getEnv('ANTHROPIC_API_KEY');
         if (!apiKey) return await this.fallbackToNative(prompt, "Missing ANTHROPIC_API_KEY");
         const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: exactModel || "claude-3-5-sonnet-20241022",
              max_tokens: 4096,
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) return await this.fallbackToNative(prompt, `Anthropic Auth/Error: ${data.error.message || JSON.stringify(data.error)}`);
         return data.content[0].text;
      }
      
      else if (prov === 'groq') {
         const apiKey = this.getEnv('GROQ_API_KEY');
         if (!apiKey) return await this.fallbackToNative(prompt, "Missing GROQ_API_KEY");
         const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "llama3-70b-8192", 
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) return await this.fallbackToNative(prompt, `Groq Auth/Error: ${data.error.message || JSON.stringify(data.error)}`);
         return data.choices[0].message.content;
      }
      
      else if (prov === 'openrouter') {
         const apiKey = this.getEnv('OPENROUTER_API_KEY');
         if (!apiKey) return await this.fallbackToNative(prompt, "Missing OPENROUTER_API_KEY");
         const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
               "Content-Type": "application/json", 
               "Authorization": `Bearer ${apiKey}`,
               "HTTP-Referer": "https://seabot.dev", 
               "X-Title": "SeaBot OS" 
            },
            body: JSON.stringify({
              model: exactModel || "anthropic/claude-3.5-sonnet",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) return await this.fallbackToNative(prompt, `OpenRouter Auth/Error: ${data.error.message || JSON.stringify(data.error)}`);
         return data.choices[0].message.content;
      }

      else if (prov === 'mistral') {
         const apiKey = this.getEnv('MISTRAL_API_KEY');
         if (!apiKey) return await this.fallbackToNative(prompt, "Missing MISTRAL_API_KEY");
         const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "mistral-large-latest",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) return await this.fallbackToNative(prompt, `Mistral Auth/Error: ${data.error.message || JSON.stringify(data.error)}`);
         return data.choices[0].message.content;
      }

      else {
          const apiKey = this.getEnv('GEMINI_API_KEY');
          if (!apiKey) return await this.fallbackToNative(prompt, "Missing GEMINI_API_KEY");
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const response = await ai.models.generateContent({
             model: exactModel || "gemini-2.5-flash", 
             contents: prompt,
          });
          return response.text || "";
      }
    } catch (e: any) {
      return await this.fallbackToNative(prompt, `Gateway Protocol Failure (${prov}): ${e.message}`);
    }
  }
}

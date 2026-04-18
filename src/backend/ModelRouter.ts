import { GoogleGenAI } from "@google/genai";

export type ModelProvider = string; // e.g., "openai:gpt-4o", "anthropic:claude-3-5-sonnet-20241022"

/**
 * ModelRouter
 * Real OpenClaw Gateway router mapping local API keys into cloud executions.
 * Now supports dynamic exact model targeting (provider:modelName).
 */
export class ModelRouter {
  static async generate(providerString: string, prompt: string): Promise<string> {
    const parts = providerString.split(':');
    const prov = parts[0].toLowerCase();
    // Re-join the rest in case models have colons (e.g., OpenRouter paths)
    const exactModel = parts.slice(1).join(':'); 
    
    try {
      if (prov === 'openai') {
         const apiKey = process.env.OPENAI_API_KEY;
         if (!apiKey) throw new Error("OPENAI_API_KEY inside environment is missing.");
         const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) throw new Error(data.error.message);
         return data.choices[0].message.content;
      }
      
      else if (prov === 'anthropic') {
         const apiKey = process.env.ANTHROPIC_API_KEY;
         if (!apiKey) throw new Error("ANTHROPIC_API_KEY inside environment is missing.");
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
         if (data.error) throw new Error(data.error.message);
         return data.content[0].text;
      }
      
      else if (prov === 'groq') {
         const apiKey = process.env.GROQ_API_KEY;
         if (!apiKey) throw new Error("GROQ_API_KEY inside environment is missing.");
         const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "llama3-70b-8192", // Fast open source model
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) throw new Error(data.error.message);
         return data.choices[0].message.content;
      }
      
      else if (prov === 'openrouter') {
         const apiKey = process.env.OPENROUTER_API_KEY;
         if (!apiKey) throw new Error("OPENROUTER_API_KEY inside environment is missing.");
         const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            // Include HTTP-Referer for OpenRouter rankings optionally
            body: JSON.stringify({
              model: exactModel || "anthropic/claude-3.5-sonnet",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) throw new Error(data.error.message);
         return data.choices[0].message.content;
      }

      else if (prov === 'mistral') {
         const apiKey = process.env.MISTRAL_API_KEY;
         if (!apiKey) throw new Error("MISTRAL_API_KEY inside environment is missing.");
         const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: exactModel || "mistral-large-latest",
              messages: [{ role: "user", content: prompt }]
            })
         });
         const data = await res.json();
         if (data.error) throw new Error(data.error.message);
         return data.choices[0].message.content;
      }

      // Default mapping internally falls back to local Google AI instance included
      else {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Default AI requires this.");
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const response = await ai.models.generateContent({
             model: exactModel || "gemini-2.5-flash", // Dynamic override
             contents: prompt,
          });
          return response.text || "";
      }
    } catch (e: any) {
      throw new Error(`ModelRouter Gateway Error [${prov}]: ${e.message}`);
    }
  }
}

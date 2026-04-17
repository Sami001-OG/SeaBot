import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Ensure we have access to Gemini for embeddings
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DB_DIR = path.resolve(process.cwd(), ".nexus");
const DB_PATH = path.join(DB_DIR, "vectors.json");

export interface MemoryEntry {
  id: string;
  content: string;
  tags: string[];
  embedding: number[];
  timestamp: number;
}

export class VectorDB {
  private entries: MemoryEntry[] = [];
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      const data = await fs.readFile(DB_PATH, "utf-8");
      this.entries = JSON.parse(data);
    } catch (e) {
      this.entries = [];
    }
    this.initialized = true;
  }

  async save() {
    await fs.writeFile(DB_PATH, JSON.stringify(this.entries, null, 2), "utf-8");
  }

  async store(content: string, tags: string[] = []) {
    await this.init();
    try {
      const resp = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: content,
      });
      if (!resp.embeddings || !resp.embeddings[0].values) throw new Error("No embedding returned");
      
      const embedding = resp.embeddings[0].values;
      this.entries.push({
        id: Math.random().toString(36).substring(2, 10),
        content,
        tags,
        embedding,
        timestamp: Date.now()
      });
      
      await this.save();
      return true;
    } catch (e: any) {
      console.error("Vector DB Embedding error:", e);
      return false;
    }
  }

  async search(query: string, topK: number = 3) {
    await this.init();
    if (this.entries.length === 0) return [];

    try {
      const resp = await ai.models.embedContent({
        model: "text-embedding-004", 
        contents: query,
      });
      if (!resp.embeddings || !resp.embeddings[0].values) return [];
      
      const qVec = resp.embeddings[0].values;

      const scored = this.entries.map(e => ({
        content: e.content,
        tags: e.tags,
        score: this.cosineSimilarity(qVec, e.embedding)
      }));

      // Sort by highest similarity
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, topK);
    } catch (e: any) {
         console.error("Vector DB Search error:", e);
         return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { ModelRouter, ModelProvider } from "./ModelRouter.js";
import { VectorDB } from "./VectorDB.js";

type LogCallback = (type: 'thought' | 'action' | 'observation' | 'system' | 'error' | 'reflection', text: string) => void;

interface ToolDesc {
  name: string;
  description: string;
  usage: string;
  execute: (args: any) => Promise<string>;
}

const vdb = new VectorDB(); // Initialize System Memory

export async function runRealAgent(
  objective: string, 
  log: LogCallback, 
  depth: number = 0,
  provider: ModelProvider = 'gemini'
): Promise<string> {
  
  if (depth > 2) {
    return "Error: Maximum sub-agent depth exceeded (Preventing infinite swarm).";
  }

  const tools: Record<string, ToolDesc> = {
    system_exec: {
      name: "system_exec",
      description: "Execute a shell command locally (Linux env) and get stdout/stderr.",
      usage: "{\"command\": \"ls -la\"}",
      execute: async (args: { command: string }) => {
        return new Promise((resolve) => {
          exec(args.command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
               resolve(`Error: ${error.message}\nStderr: ${stderr}`);
               return;
            }
            resolve(stdout || stderr || "Command executed successfully with no output.");
          });
        });
      }
    },
    fs_list: {
      name: "fs_list",
      description: "Lists all files and directories in a given path. Crucial for understanding project architecture.",
      usage: "{\"path\": \"./src\"}",
      execute: async (args: { path: string }) => {
        try {
          const fullPath = path.resolve(process.cwd(), args.path || '.');
          const items = await fs.readdir(fullPath, { withFileTypes: true });
          return items.map(i => `${i.isDirectory() ? '[DIR]' : '[FILE]'} ${i.name}`).join('\n');
        } catch (e: any) {
          return `Error reading directory: ${e.message}`;
        }
      }
    },
    fs_read: {
      name: "fs_read",
      description: "Read the contents of a file at a specified path.",
      usage: "{\"path\": \"package.json\"}",
      execute: async (args: { path: string }) => {
        try {
          const fullPath = path.resolve(process.cwd(), args.path);
          return await fs.readFile(fullPath, 'utf8');
        } catch (e: any) {
          return `Error reading file: ${e.message}`;
        }
      }
    },
    fs_write: {
      name: "fs_write",
      description: "Write content to a file. Overwrites existing content. Automatically creates missing directories.",
      usage: "{\"path\": \"src/components/Button.tsx\", \"content\": \"...code...\"}",
      execute: async (args: { path: string; content: string }) => {
        try {
          const fullPath = path.resolve(process.cwd(), args.path);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, args.content, 'utf8');
          return `Successfully wrote to ${args.path}`;
        } catch (e: any) {
          return `Error writing file: ${e.message}`;
        }
      }
    },
    search_codebase: {
      name: "search_codebase",
      description: "Searches the codebase for a specific string or regex pattern (uses grep). Essential for finding function usages, variables, or error causes.",
      usage: "{\"pattern\": \"function init\", \"directory\": \"./src\"}",
      execute: async (args: { pattern: string; directory: string }) => {
        return new Promise((resolve) => {
          const target = args.directory || '.';
          // -r (recursive), -n (line number), -I (ignore binaries)
          const cmd = `grep -rnI "${args.pattern}" ${target} | head -n 50`;
          exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
             if (error && error.code === 1) resolve("No matches found.");
             else if (error) resolve(`Error: ${error.message}`);
             else resolve(stdout || "No matches.");
          });
        });
      }
    },
    web_fetch: {
      name: "web_fetch",
      description: "Fetches and extracts text content from a web URL. Strips HTML.",
      usage: "{\"url\": \"https://example.com\"}",
      execute: async (args: { url: string }) => {
        try {
          const r = await fetch(args.url);
          const text = await r.text();
          // Simplified HTML strip for raw text embedding
          return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .substring(0, 4000); // Truncate to save context window
        } catch (e: any) {
          return `Error fetching URL: ${e.message}`;
        }
      }
    },
    memory_store: {
      name: "memory_store",
      description: "Stores important facts, codebase context, or personal rules into Long-Term Vector Memory.",
      usage: "{\"content\": \"User uses Express.js on the backend\", \"tags\": [\"tech_stack\"]}",
      execute: async (args: { content: string, tags?: string[] }) => {
        const success = await vdb.store(args.content, args.tags || []);
        return success ? "Memory successfully embedded and stored." : "Failed to store memory.";
      }
    },
    memory_search: {
      name: "memory_search",
      description: "Semantic search against Long-Term Vector Memory to recall related past facts or context.",
      usage: "{\"query\": \"What is our backend tech stack?\"}",
      execute: async (args: { query: string }) => {
        const results = await vdb.search(args.query);
        if (results.length === 0) return "No relevant memories found.";
        return "Memories retrieved:\n" + results.map(r => `- [Score: ${r.score.toFixed(2)}] ${r.content}`).join('\n');
      }
    },
    delegate_task: {
      name: "delegate_task",
      description: "Swarm Logic. Spawns a specialized sub-agent to accomplish a complex sub-task in parallel.",
      usage: "{\"role\": \"security_reviewer\", \"objective\": \"Find XSS vulnerabilities in index.js\"}",
      execute: async (args: { role: string; objective: string }) => {
        log('system', `Spawning Agent => [${args.role.toUpperCase()}]`);
        
        // Wrap logs to show the sub-agent prefix
        const childLog: LogCallback = (type, text) => {
           log(type, `[AGENT:${args.role}] ${text}`);
        };
        
        const finalAnswer = await runRealAgent(args.objective, childLog, depth + 1, provider);
        return `Sub-agent completed objective. Final Output:\n${finalAnswer}`;
      }
    }
  };

  const toolDescriptions = Object.values(tools).map(t => 
    `- ${t.name}: ${t.description}\n  Format: ${t.usage}`
  ).join('\n\n');

  const systemPrompt = `You are the SeaBot / OpenClaw Autonomous Engine.
You operate as a Senior Developer, Systems Analyst, and IT Operator. 
The user is your CEO. They will give you high-level goals (e.g., "Build a crypto signal dashboard"). Your job is to autonomously plan the architecture, execute terminal commands, manage the codebase, and finalize the application.

Task Objective: ${objective}

Available Tools (Your OS Capabilities):
${toolDescriptions}

Rules:
1. You act autonomously in a ReAct loop (Thought -> Action -> Observation).
2. To understand a project, use 'fs_list' followed by 'fs_read'. 
3. You can build entire applications by chaining 'fs_write' and 'system_exec' (to install deps).
4. If a task is massively complex, use 'delegate_task' to spawn parallel sub-agents (e.g., [RESEARCHER], [CODER]).
5. Use 'memory_store' and 'memory_search' to leverage long-term project context.
6. When writing code, write production-ready implementations, not placeholders.

Use exactly this format:
Thought: <your step-by-step reasoning>
Action: <tool_name>
Action Input: <json mapping EXACTLY to the tool's usage schema>

Wait for the 'Observation: ...' from the system before your next Thought. 

Once you have completed the objective or found the final answer, output:
Thought: I have finished the task.
Final Answer: <your final synthesized conclusion>
`;

  let history = systemPrompt + "\n\n---\nBEGIN\n";
  let steps = 0;
  const MAX_STEPS = 25; // Massive buffer for full app generation pipelines

  while (steps < MAX_STEPS) {
    steps++;
    try {
      // Replaced fixed Gemini API call with Dynamic OpenClaw Model Routing Architecture
      const text = await ModelRouter.generate(provider, history);
      
      // Parse ReAct format
      const thoughtMatch = text.match(/Thought:\s*(.*?)(?=\nAction:|\nFinal Answer:|$)/s);
      if (thoughtMatch && thoughtMatch[1]) {
         log('thought', `${thoughtMatch[1].trim()}`);
      }

      const finalAnswerMatch = text.match(/Final Answer:\s*(.*)/s);
      if (finalAnswerMatch) {
         log('reflection', `Objective completed.`);
         return finalAnswerMatch[1].trim();
      }

      const actionMatch = text.match(/Action:\s*(.*?)\nAction Input:\s*({.*})/s);
      if (actionMatch) {
         const toolName = actionMatch[1].trim();
         const toolInputRaw = actionMatch[2].trim();
         
         log('action', `Tool Call: ${toolName} (${toolInputRaw})`);
         
         try {
           const parsedInput = JSON.parse(toolInputRaw);
           if (!tools[toolName]) {
             const obs = `Tool not found: ${toolName}`;
             log('error', obs);
             history += text + `\nObservation: ${obs}\n`;
             continue;
           }

           // Explicitly execute standard tools or OS-level plugins dynamically
           const observation = await tools[toolName].execute(parsedInput);
           log('observation', `${observation.substring(0, 1000)}${observation.length > 1000 ? '... [TRUNCATED]' : ''}`);
           
           history += text + `\nObservation: ${observation}\n`;
           
         } catch (parseError: any) {
           const obs = `Failed to parse Action Input JSON: ${parseError.message}`;
           log('error', obs);
           history += text + `\nObservation: ${obs}\n`;
         }
      } else {
         if (!thoughtMatch) {
             const obs = "Format error. You must use 'Thought:', 'Action:/Action Input:', or 'Final Answer:'.";
             log('error', obs);
             history += text + `\nObservation: ${obs}\n`;
         } else {
             history += text + "\n";
         }
      }

    } catch (e: any) {
       log('error', `Agent Router LLM Failure: ${e.message}`);
       return `Failed: ${e.message}`;
    }
  }

  log('error', "Max OS cycle limits exceeded. Terminating to prevent infinite loop or memory leak.");
  return "Task timed out.";
}

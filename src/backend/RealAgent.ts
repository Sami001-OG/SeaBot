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

export type AgentNode = 'PLANNER' | 'RESEARCHER' | 'EXECUTION' | 'REVIEWER' | 'FINAL_OUTPUT';

export async function runRealAgent(
  objective: string, 
  log: LogCallback, 
  depth: number = 0,
  provider: ModelProvider = 'gemini:gemini-2.5-flash'
): Promise<string> {
  
  if (depth > 2) {
    return "Error: Maximum sub-agent depth exceeded (Preventing infinite swarm).";
  }

  // --- Sandboxed Execution Engine ---
  const tools: Record<string, ToolDesc> = {
    system_exec: {
      name: "system_exec",
      description: "Execute a shell command locally (Linux env) and get stdout/stderr.",
      usage: "{\"command\": \"ls -la\"}",
      execute: async (args: { command: string }) => {
        return new Promise((resolve) => {
          exec(args.command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
               // Self-Healing mechanism natively traps the exit code
               resolve(`[EXIT CODE ${error.code || 1}] Error: ${error.message}\nStderr: ${stderr}`);
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
          return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .substring(0, 4000); 
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

  // Graph State Machine
  let currentNode: AgentNode = 'PLANNER';
  let internalContext = `User Objective: ${objective}\n\n`;
  let finalResult = "";

  const MAX_GLOBAL_STEPS = 30;
  let globalSteps = 0;

  log('system', `[OS BOOT] Initializing Graph Cognitive Architecture. Target Node: ${currentNode}`);

  while (globalSteps < MAX_GLOBAL_STEPS && currentNode !== 'FINAL_OUTPUT') {
    globalSteps++;

    try {
       // === NODE: PLANNER ===
       if (currentNode === 'PLANNER') {
          log('reflection', `[NODE: PLANNER] Structuring execution graph...`);
          
          const plannerPrompt = `You are the PLANNER NODE of the OpenClaw AI OS.
Your job is to read the objective and output a JSON array of actionable steps required to achieve it.
You MUST format your ONLY output as a strict JSON element like this:
{
  "rationale": "Why we are doing this...",
  "steps": ["Step 1...", "Step 2..."],
  "next_node": "RESEARCHER" or "EXECUTION" (If you know what to do already, go to EXECUTION, otherwise RESEARCHER to check files/memory first)
}

Context so far:
${internalContext}`;

          const res = await ModelRouter.generate(provider, plannerPrompt);
          try {
             // Extract JSON
             const match = res.match(/\{[\s\S]*\}/);
             if (!match) throw new Error("No JSON found");
             const plan = JSON.parse(match[0]);
             
             log('thought', `Plan formulated: ${plan.rationale}\nSteps:\n- ${plan.steps.join('\n- ')}`);
             internalContext += `\n[PLANNER NODE OUTPUT]\nPlan: ${JSON.stringify(plan.steps)}\n\n`;
             currentNode = plan.next_node === 'RESEARCHER' ? 'RESEARCHER' : 'EXECUTION';
          } catch(e) {
             log('error', `Planner Node failed to structure JSON. Dropping fallback to Execution.`);
             currentNode = 'EXECUTION'; // Fallback
          }
       }

       // === NODE: RESEARCHER ===
       else if (currentNode === 'RESEARCHER') {
          log('reflection', `[NODE: RESEARCHER] Gathering contextual context & scanning databases...`);
          
          let researchLoops = 0;
          let researchDone = false;
          let researchMemory = "";

          while (researchLoops < 5 && !researchDone) {
            researchLoops++;
            const researchPrompt = `You are the RESEARCHER NODE.
Tools available: fs_list, fs_read, search_codebase, memory_search, web_fetch.
Your goal is to gather ONLY the information needed to execute the plan.
${toolDescriptions}

Current Context:
${internalContext}
Recent Research:
${researchMemory}

Format your response EXACTLY like this:
Thought: I need to check X...
Action: fs_read
Action Input: {"path":"..."}
OR
Thought: I have gathered enough context to proceed.
Next Node: EXECUTION`;

            const res = await ModelRouter.generate(provider, researchPrompt);
            const nextNodeMatch = res.match(/Next Node:\s*(.*)/i);
            
            if (nextNodeMatch && nextNodeMatch[1].trim().toUpperCase() === 'EXECUTION') {
               internalContext += `\n[RESEARCHER CONTEXT GATHERED]\n${researchMemory}\n`;
               currentNode = 'EXECUTION';
               researchDone = true;
               break;
            }

            const actionMatch = res.match(/Action:\s*(.*?)\nAction Input:\s*({.*})/s);
            if (actionMatch) {
               const toolName = actionMatch[1].trim();
               const toolInputRaw = actionMatch[2].trim();
               log('action', `[RESEARCH] ${toolName} (${toolInputRaw})`);
               try {
                 const parsed = JSON.parse(toolInputRaw);
                 if (tools[toolName]) {
                    const obs = await tools[toolName].execute(parsed);
                    researchMemory += `\nExec ${toolName} result:\n${obs}\n`;
                    log('observation', `[RESEARCH RESULT] ${obs.substring(0, 200)}...`);
                 } else {
                    researchMemory += `\nError: Tool ${toolName} does not exist in Researcher Node.\n`;
                 }
               } catch (e) {}
            } else {
               currentNode = 'EXECUTION';
               researchDone = true;
            }
          }
          if (!researchDone) currentNode = 'EXECUTION';
       }

       // === NODE: EXECUTION (The ReAct Loop) ===
       else if (currentNode === 'EXECUTION') {
          log('reflection', `[NODE: EXECUTION] Applying actions to environment...`);
          
          let execLoops = 0;
          let execDone = false;
          
          while (execLoops < 10 && !execDone) {
            execLoops++;
            const execPrompt = `You are the EXECUTION NODE. 
Your job is to perform actions to complete the user objective based on the Plan.

Current Context & Plan:
${internalContext}

Available Tools:
${toolDescriptions}

To use a tool, return EXACTLY:
Thought: <reasoning>
Action: <tool_name>
Action Input: <json>

If you have executed everything and built/modified the requirements:
Thought: Execution is complete. I need to verify my work.
Next Node: REVIEWER`;

            const res = await ModelRouter.generate(provider, execPrompt);
            
            const nextNodeMatch = res.match(/Next Node:\s*(.*)/i);
            if (nextNodeMatch && nextNodeMatch[1].trim().toUpperCase() === 'REVIEWER') {
               currentNode = 'REVIEWER';
               execDone = true;
               break;
            }

            const actionMatch = res.match(/Action:\s*(.*?)\nAction Input:\s*({.*})/s);
            if (actionMatch) {
               const toolName = actionMatch[1].trim();
               const toolInputRaw = actionMatch[2].trim();
               log('action', `[EXECUTE] ${toolName} (${toolInputRaw})`);
               
               let obs = "";
               try {
                 const parsed = JSON.parse(toolInputRaw);
                 if (tools[toolName]) {
                    obs = await tools[toolName].execute(parsed);
                    log('observation', `[OS RESPONSE] ${obs.substring(0, 300)}...`);
                 } else {
                    obs = `Error: Tool ${toolName} does not exist.`;
                    log('error', `Tool not found: ${toolName}`);
                 }
               } catch (e: any) {
                 obs = `Failed to parse or execute: ${e.message}`;
                 log('error', obs);
               }
               internalContext += `\n[EXEC NODE: Action ${toolName}]\n${obs}\n`;
            } else {
               // Safe fallback if the model hallucinates formatting:
               const thoughtMatch = res.match(/Thought:\s*(.*?)(?=\n|$)/s);
               if (thoughtMatch) log('thought', thoughtMatch[1]);
               
               internalContext += `\n[EXEC NODE: LLM output without action]\n${res}\n`;
               
               // Force move to Reviewer if we hit an ambiguous state
               if (res.toLowerCase().includes("done") || res.toLowerCase().includes("complete")) {
                 currentNode = 'REVIEWER';
                 execDone = true;
               }
            }
          }
          if (!execDone) currentNode = 'REVIEWER'; // Timeout safe-guard
       }

       // === NODE: REVIEWER (Self-Healing & Auto-Correction) ===
       else if (currentNode === 'REVIEWER') {
          log('reflection', `[NODE: REVIEWER] Analyzing execution output for flaws or anomalies...`);
          
          const reviewPrompt = `You are the REVIEWER NODE.
Review the entire Execution Context log. Did the execution fully fulfill the User Objective? Were there any script errors (e.g., EXIT CODE 1)?
If there are errors or missing logic, you MUST send it back to EXECUTION node.
If everything is perfect, proceed to FINAL_OUTPUT.

Context Log:
${internalContext}

Respond EXACTLY in this JSON format:
{
  "critique": "Your critical analysis of the work...",
  "pass": true or false,
  "next_node": "FINAL_OUTPUT" or "EXECUTION",
  "feedback_to_execution": "If pass is false, what exactly needs to be fixed?"
}`;

          const res = await ModelRouter.generate(provider, reviewPrompt);
          try {
             const match = res.match(/\{[\s\S]*\}/);
             if (!match) throw new Error("No JSON found");
             const evaluation = JSON.parse(match[0]);
             
             log('thought', `Evaluation pass: ${evaluation.pass}. Critique: ${evaluation.critique}`);
             
             if (evaluation.pass === true || evaluation.next_node === 'FINAL_OUTPUT') {
                currentNode = 'FINAL_OUTPUT';
             } else {
                log('error', `Self-Healing Triggered. Routing back to EXECUTION NODE to address: ${evaluation.feedback_to_execution}`);
                internalContext += `\n[REVIEWER CRITIQUE/FEEDBACK FOR YOU TO FIX]\n${evaluation.feedback_to_execution}\n`;
                currentNode = 'EXECUTION';
             }
          } catch(e) {
             log('thought', `Reviewer bypassed/failed syntax. Proceeding to Output.`);
             currentNode = 'FINAL_OUTPUT';
          }
       }

    } catch (e: any) {
       log('error', `OS Graph Architecture Failure (Node ${currentNode}): ${e.message}`);
       return `Task critically failed in ${currentNode} node: ${e.message}`;
    }
  }

  // === NODE: FINAL OUTPUT ===
  log('system', `[NODE: FINAL_OUTPUT] Synthesizing artifact rendering for user...`);
  const finalPrompt = `You are the FINAL OUTPUT NODE. 
Synthesize a direct, professional confirmation of what was done based on the context. Provide any code artifacts directly so the web UI handles them.

Objective: ${objective}
Context Log:
${internalContext}

Provide the final answer seamlessly. If there is code to output, use markdown blocks appropriately.`;

  finalResult = await ModelRouter.generate(provider, finalPrompt);
  
  // Implicitly store the finished objective in Vector Memory for long-term project grounding
  await vdb.store(`Task Completed: ${objective}\nSummary: ${finalResult.substring(0, 1000)}`, ['task_history', 'implicit_memory']);

  return finalResult;
}

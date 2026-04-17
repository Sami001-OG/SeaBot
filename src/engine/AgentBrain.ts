import { AgentRole, AgentStatus, ReActStep, Tool, AgentState, AgentEvents } from './types';
import { TaskDAG } from './TaskDAG';

// Standard tiny Event Emitter for UI bindings
type Callback = (...args: any[]) => void;

export class AgentBrain {
  public id: string;
  public role: AgentRole;
  public state: AgentStatus = 'idle';
  public contextBuffer: ReActStep[] = [];
  
  private listeners: Record<string, Callback[]> = {};
  private tools: Map<string, Tool> = new Map();
  public childAgents: AgentBrain[] = [];

  constructor(id: string, role: AgentRole = 'orchestrator') {
    this.id = id;
    this.role = role;
    this.registerCoreTools();
  }

  // --- Event Handling ---
  public on<K extends keyof AgentEvents>(event: K, callback: AgentEvents[K]) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  private emit<K extends keyof AgentEvents>(event: K, ...args: Parameters<AgentEvents[K]>) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }

  private setStatus(newStatus: AgentStatus) {
    this.state = newStatus;
    this.emit('status_change', newStatus);
  }

  private logStep(type: ReActStep['type'], content: string, meta?: any) {
    const step: ReActStep = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      agentId: this.id,
      content,
      meta
    };
    this.contextBuffer.push(step);
    this.emit('step', step);
  }

  // --- Core Engine Methods ---

  /**
   * Main entrypoint: Submits a high-level objective to the agent.
   */
  public async executeObjective(objective: string) {
    this.setStatus('planning');
    this.logStep('system', `Received objective: "${objective}"`);
    
    // Simulate LLM Plan-and-Solve decomposition
    this.logStep('thought', `I need to break down the objective: "${objective}" into a Directed Acyclic Graph (DAG) of sub-tasks.`);
    await this.delay(1200);

    // Mocked decomposition for architecture demonstration
    const dag = new TaskDAG([
      { id: 'T1', objective: 'Scan local environment constraints', dependencies: [], requiredRole: 'researcher' },
      { id: 'T2', objective: 'Compile necessary binaries', dependencies: ['T1'], requiredRole: 'coder' },
      { id: 'T3', objective: 'Run integration tests', dependencies: ['T2'], requiredRole: 'qa' }
    ]);

    this.logStep('action', `Generated Task DAG with ${dag.getAvailableTasks().length} root node(s).`);
    
    // Execute DAG
    while (!dag.isComplete()) {
      const failed = dag.getFailedTask();
      if (failed) {
        this.setStatus('failed');
        this.logStep('error', `Workflow halted. Task ${failed.id} failed: ${failed.result}`);
        return;
      }

      const available = dag.getAvailableTasks();
      if (available.length === 0) {
        await this.delay(500); // Wait for async tasks resolving (if running parallel)
        continue;
      }

      // We'll process sequentially for demonstration
      for (const task of available) {
        dag.updateStatus(task.id, 'in_progress');
        
        // Spawn sub-agent if required role differs from current
        if (task.requiredRole && task.requiredRole !== this.role) {
          const result = await this.delegateTask(task.id, task.objective, task.requiredRole);
          dag.updateStatus(task.id, 'completed', result);
        } else {
          // Process locally via ReAct loop
          const result = await this.runReActLoop(task.objective);
          dag.updateStatus(task.id, 'completed', result);
        }
      }
    }

    this.setStatus('completed');
    this.logStep('system', 'Workflow successfully completed. All tasks resolved.');
  }

  /**
   * The core ReAct loop: Observe -> Think -> Act -> Reflect
   */
  private async runReActLoop(taskObjective: string): Promise<string> {
    this.setStatus('thinking');
    this.logStep('system', `Starting ReAct loop for task: "${taskObjective}"`);
    
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      
      this.setStatus('thinking');
      await this.delay(800);
      
      // MOCK LLM Thought Process
      if (iterations === 1) {
         this.logStep('thought', `To achieve "${taskObjective}", I should check the current system state using the system_stats tool.`);
         
         this.setStatus('acting');
         await this.delay(600);
         this.logStep('action', `Calling tool: system_stats`, { toolName: 'system_stats', toolArgs: {} });
         
         const result = await this.executeTool('system_stats', {});
         this.setStatus('observing');
         await this.delay(400);
         this.logStep('observation', `Tool result: ${result}`);
      } else {
         this.logStep('thought', `I have enough information to mark this task complete.`);
         this.setStatus('reflecting');
         await this.delay(500);
         this.logStep('reflection', `The task "${taskObjective}" was executed successfully. Output is verified.`);
         return 'Task executed correctly.';
      }
    }
    
    return 'Task timed out after MAX_ITERATIONS.';
  }

  /**
   * Generates a sub-agent to handle specialized domains.
   */
  private async delegateTask(taskId: string, objective: string, role: AgentRole): Promise<string> {
    this.setStatus('thinking');
    await this.delay(400);
    this.logStep('thought', `Task requires a ${role.toUpperCase()} specialist. Spawning sub-agent.`);
    
    const childId = `${this.id}-${role}-${Math.floor(Math.random()*1000)}`;
    const childAgent = new AgentBrain(childId, role);
    this.childAgents.push(childAgent);
    this.emit('agent_spawned', childId, role);
    
    // Pipe child logs to our logs as observations
    childAgent.on('step', (step) => {
      // Just mirror the UI event for the dashboard display
      this.emit('step', step); 
    });

    await childAgent.executeObjective(objective);
    
    return `Sub-agent ${childId} completed objective.`;
  }

  /**
   * Core Tools Registry Pipeline
   */
  public registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  private async executeTool(toolName: string, args: any): Promise<string> {
    const start = performance.now();
    try {
      const tool = this.tools.get(toolName);
      if (!tool) throw new Error(`Tool ${toolName} not found in whitelist.`);
      const res = await tool.execute(args);
      return res;
    } catch (e: any) {
      return `Error executing tool: ${e.message}`;
    }
  }

  private registerCoreTools() {
    this.registerTool({
      name: 'system_stats',
      description: 'Returns real-time system resources',
      schema: {},
      execute: async () => {
        await this.delay(200);
        return JSON.stringify({ cpu_usage: '12%', mem_free: '8.4GB', platform: 'darwin' });
      }
    });

    this.registerTool({
      name: 'read_memory',
      description: 'Reads long-term contextual vector memory',
      schema: { query: 'string' },
      execute: async ({ query }) => {
        await this.delay(300);
        return `Found 3 results for "${query}" in Vector DB.`;
      }
    });
  }

  public getContextBuffer() {
    return this.contextBuffer;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

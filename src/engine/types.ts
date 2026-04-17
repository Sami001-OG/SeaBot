export type AgentRole = 'orchestrator' | 'coder' | 'researcher' | 'qa' | 'system';

export type AgentStatus = 
  | 'idle' 
  | 'planning' 
  | 'thinking' 
  | 'acting' 
  | 'observing' 
  | 'reflecting' 
  | 'completed' 
  | 'failed';

export interface Tool {
  name: string;
  description: string;
  schema: any; // JSON schema for arguments
  execute: (args: Record<string, any>) => Promise<string>;
}

export interface TaskNode {
  id: string;
  objective: string;
  dependencies: string[]; // IDs of tasks that must be completed first
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  assignedAgentId?: string;
  requiredRole?: AgentRole;
}

export interface ReActStep {
  id: string;
  timestamp: number;
  type: 'thought' | 'action' | 'observation' | 'system' | 'error' | 'reflection';
  agentId: string;
  content: string;
  meta?: {
    toolName?: string;
    toolArgs?: any;
    executionTimeMs?: number;
    tokensUsed?: number;
  };
}

export interface AgentState {
  id: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask?: string;
  contextWindow: ReActStep[];
  memoryRefs: string[]; // UUIDs to vector DB chunks
}

// Event map for the Agent EventEmitter
export type AgentEvents = {
  'status_change': (status: AgentStatus) => void;
  'step': (step: ReActStep) => void;
  'task_complete': (taskId: string, result: string) => void;
  'agent_spawned': (childAgentId: string, role: string) => void;
};

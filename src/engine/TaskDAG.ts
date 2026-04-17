import { TaskNode } from './types';

export class TaskDAG {
  private nodes: Map<string, TaskNode> = new Map();

  constructor(tasks: Omit<TaskNode, 'status'>[]) {
    tasks.forEach(task => {
      this.nodes.set(task.id, { ...task, status: 'pending' });
    });
  }

  getTask(id: string): TaskNode | undefined {
    return this.nodes.get(id);
  }

  updateStatus(id: string, status: TaskNode['status'], result?: string) {
    const task = this.nodes.get(id);
    if (task) {
      task.status = status;
      if (result) task.result = result;
      this.nodes.set(id, task);
    }
  }

  // Returns tasks that are pending and have all their dependencies completed
  getAvailableTasks(): TaskNode[] {
    const available: TaskNode[] = [];
    
    for (const task of this.nodes.values()) {
      if (task.status !== 'pending') continue;

      const depsMet = task.dependencies.every(depId => {
        const depTask = this.nodes.get(depId);
        return depTask && depTask.status === 'completed';
      });

      if (depsMet) {
        available.push(task);
      }
    }

    return available;
  }

  isComplete(): boolean {
    for (const task of this.nodes.values()) {
      if (task.status !== 'completed') return false;
    }
    return true;
  }

  getFailedTask(): TaskNode | undefined {
    for (const task of this.nodes.values()) {
      if (task.status === 'failed') return task;
    }
    return undefined;
  }
}

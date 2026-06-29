import { Orchestrator } from './Orchestrator';
import { Agent } from '../core/Agent';

export class ConcurrentOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    console.log(`[Concurrent] Running ${agents.length} agents in parallel`);
    const promises = agents.map(async (agent) => {
      const result = await agent.process(initialInput);
      return { agentId: agent.id, role: agent.role, result };
    });
    const results = await Promise.all(promises);
    // Agrupar resultados
    const summary = results.map(r => `[${r.role}]: ${r.result}`).join('\n');
    return `Concurrent results:\n${summary}`;
  }
}
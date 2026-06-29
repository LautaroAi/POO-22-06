import { Orchestrator } from './Orchestrator';
import { Agent } from '../core/Agent';

export class SequentialOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    let currentInput = initialInput;
    for (const agent of agents) {
      console.log(`[Sequential] Running agent ${agent.id} (${agent.role})`);
      currentInput = await agent.process(currentInput);
      console.log(`[Sequential] Agent ${agent.id} output:`, currentInput);
    }
    return currentInput;
  }
}
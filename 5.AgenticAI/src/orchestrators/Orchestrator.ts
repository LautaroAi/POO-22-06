import { Agent } from '../core/Agent';

export interface Orchestrator {
  execute(agents: Agent[], initialInput: string): Promise<string>;
}
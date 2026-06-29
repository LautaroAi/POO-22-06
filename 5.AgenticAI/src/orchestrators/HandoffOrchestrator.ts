import { Orchestrator } from './Orchestrator';
import { Agent } from '../core/Agent';

export class HandoffOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    let currentInput = initialInput;
    for (const agent of agents) {
      console.log(`[Handoff] Passing to agent ${agent.id} (${agent.role})`);
      // Simular que el agente decide si maneja o no
      const decision = await this.decideToHandle(agent, currentInput);
      if (decision) {
        currentInput = await agent.process(currentInput);
        console.log(`[Handoff] Agent ${agent.id} handled the task. Output:`, currentInput);
        return currentInput; // termina la cadena
      } else {
        console.log(`[Handoff] Agent ${agent.id} passed the task.`);
      }
    }
    return `No agent could handle: ${initialInput}`;
  }

  private async decideToHandle(agent: Agent, input: string): Promise<boolean> {
    // Simulación: el agente acepta si su rol coincide con palabras clave
    const role = agent.role.toLowerCase();
    const keywords = input.toLowerCase().split(' ');
    for (const kw of keywords) {
      if (role.includes(kw) || kw.includes(role)) {
        return true;
      }
    }
    // También puede aceptar si la memoria contiene algo relevante
    const memory = agent.shareMemory();
    if (memory && memory.length > 5) {
      // si tiene memoria previa, asumimos que puede manejar
      return Math.random() > 0.5;
    }
    return false;
  }
}
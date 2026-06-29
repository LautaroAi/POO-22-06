import { Orchestrator } from './Orchestrator';
import { Agent } from '../core/Agent';

export class GroupChatOrchestrator implements Orchestrator {
  private maxRounds: number = 3;

  constructor(maxRounds: number = 3) {
    this.maxRounds = maxRounds;
  }

  async execute(agents: Agent[], initialInput: string): Promise<string> {
    console.log(`[GroupChat] Debate con ${agents.length} agentes, ${this.maxRounds} rondas`);
    const allMessages: string[] = [];

    for (let round = 0; round < this.maxRounds; round++) {
      console.log(`[GroupChat] Ronda ${round + 1}`);
      const roundContributions: string[] = [];

      for (const agent of agents) {
        // Construir el prompt: solo la pregunta original + resumen de la ronda anterior (si existe)
        let prompt = initialInput;
        if (round > 0 && allMessages.length > 0) {
          // Tomar solo los mensajes de la ronda anterior (no todo el historial)
          const start = round === 1 ? 0 : allMessages.length - agents.length;
          const prevRound = allMessages.slice(start).join(' | ');
          prompt = `${initialInput}\nOpiniones previas: ${prevRound}`;
        }
        const response = await agent.process(prompt);
        roundContributions.push(`[${agent.role}]: ${response}`);
        console.log(`[${agent.role}]: ${response}`);
      }

      allMessages.push(...roundContributions);

      // Verificar consenso (más de la mitad dice "de acuerdo" o "agree")
      if (this.checkConsensus(roundContributions)) {
        return `✅ Consenso en ronda ${round+1}:\n${roundContributions.join('\n')}`;
      }
    }

    return `Sin consenso tras ${this.maxRounds} rondas.\n${allMessages.join('\n')}`;
  }

  private checkConsensus(messages: string[]): boolean {
    const lower = messages.map(m => m.toLowerCase());
    const agreeCount = lower.filter(m => m.includes('de acuerdo') || m.includes('agree')).length;
    return agreeCount >= messages.length / 2;
  }
}
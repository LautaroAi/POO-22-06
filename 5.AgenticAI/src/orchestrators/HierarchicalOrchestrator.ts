import { Orchestrator } from './Orchestrator';
import { Agent } from '../core/Agent';

export class HierarchicalOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    if (agents.length === 0) {
      return 'No agents available';
    }

    // El primer agente actúa como manager
    const manager = agents[0];
    const workers = agents.slice(1);

    console.log(`[Hierarchical] Manager ${manager.id} (${manager.role}) decomposes task`);
    const decomposition = await manager.process(`Decompose this task: ${initialInput}`);

    // Simular descomposición en subtareas (en realidad, el manager produce un plan)
    const subtasks = this.parseSubtasks(decomposition, workers.length);

    // Ejecutar subtareas en paralelo con workers
    const workerPromises = workers.map((worker, index) => {
      const subtask = subtasks[index] || `general subtask ${index}`;
      console.log(`[Hierarchical] Worker ${worker.id} (${worker.role}) processing: "${subtask}"`);
      return worker.process(subtask);
    });

    const workerResults = await Promise.all(workerPromises);

    // Manager sintetiza resultados
    const synthesis = await manager.process(
      `Synthesize these results into a final answer:\n${workerResults.join('\n')}`
    );

    return synthesis;
  }

  private parseSubtasks(decomposition: string, numWorkers: number): string[] {
    // Simulación simple: dividir por líneas o crear subtareas genéricas
    const lines = decomposition.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= numWorkers) {
      return lines.slice(0, numWorkers);
    }
    // Si no hay suficientes, rellenar con genéricos
    const result: string[] = [];
    for (let i = 0; i < numWorkers; i++) {
      result.push(lines[i] || `Subtask ${i+1}`);
    }
    return result;
  }
}
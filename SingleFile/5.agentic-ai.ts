// Agentic AI con memoria, herramientas, guardrails y 5 orquestadores

// core
class Memory {
  private thoughts: string[] = [];
  addThought(thought: string): void { this.thoughts.push(thought); }
  getThoughts(): string[] { return [...this.thoughts]; }
  clear(): void { this.thoughts = []; }
  summarize(): string { return this.thoughts.join(' → '); }
}

interface Tool {
  name: string;
  execute(input: string): Promise<string>;
}
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  register(tool: Tool): void { this.tools.set(tool.name, tool); }
  get(name: string): Tool | undefined { return this.tools.get(name); }
  list(): string[] { return Array.from(this.tools.keys()); }
}

interface Guardrail {
  name: string;
  validate(action: string, context: any): Promise<{ allowed: boolean; reason?: string }>;
}
class GuardrailRegistry {
  private guards: Guardrail[] = [];
  add(guard: Guardrail): void { this.guards.push(guard); }
  async check(action: string, context: any): Promise<void> {
    for (const g of this.guards) {
      const result = await g.validate(action, context);
      if (!result.allowed) throw new Error(`Guardrail "${g.name}" blocked action: ${result.reason}`);
    }
  }
}

class Agent {
  public id: string; public role: string; public memory: Memory;
  private tools: ToolRegistry; private guards: GuardrailRegistry;
  constructor(id: string, role: string, tools?: ToolRegistry, guards?: GuardrailRegistry) {
    this.id = id; this.role = role; this.memory = new Memory();
    this.tools = tools || new ToolRegistry();
    this.guards = guards || new GuardrailRegistry();
  }
  async process(input: string): Promise<string> {
    await this.guards.check(input, { agent: this.id, input });
    this.memory.addThought(`Input: ${input}`);
    const lower = input.toLowerCase();
    if (lower.includes('debemos') || lower.includes('diagnosticar') || lower.includes('enfermedades')) {
      const opinion = this.generateOpinion(input);
      this.memory.addThought(`Opinion: ${opinion}`);
      return opinion;
    }
    const toolDecision = this.decideTool(input);
    if (toolDecision) {
      try {
        const result = await this.executeTool(toolDecision.toolName, toolDecision.input);
        this.memory.addThought(`Tool result: ${result}`);
        return result;
      } catch (e) { return `Error: ${e}`; }
    }
    const response = `[${this.role}] procesa: "${input.substring(0, 40)}..."`;
    this.memory.addThought(`Response: ${response}`);
    return response;
  }
  private generateOpinion(input: string): string {
    const role = this.role;
    if (role === 'Matemático') return 'Como matemático, creo que la IA puede ser precisa si los modelos están bien entrenados, pero siempre hay margen de error.';
    if (role === 'Investigador') return 'Desde la investigación, veo que la IA ya supera a médicos en ciertos diagnósticos, pero faltan estudios a largo plazo.';
    if (role === 'Analista de datos') return 'Los datos muestran que la IA reduce falsos negativos, pero la calidad de los datos es clave.';
    if (role === 'Coordinador') return 'Como coordinador, recomiendo un enfoque híbrido: IA + supervisión médica.';
    return `[${role}] opina: ${input.substring(0, 30)}...`;
  }
  private decideTool(input: string): { toolName: string; input: string; action: string } | null {
    const lower = input.toLowerCase();
    const available = this.tools.list();
    if (lower.includes('calcular') && available.includes('calculator')) return { toolName: 'calculator', input, action: 'calculate' };
    if (lower.includes('buscar') && available.includes('web_search')) return { toolName: 'web_search', input, action: 'search' };
    if (lower.includes('base de datos') && available.includes('db_query')) return { toolName: 'db_query', input, action: 'query' };
    return null;
  }
  private async executeTool(toolName: string, input: string): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);
    return await tool.execute(input);
  }
  shareMemory(): string { return this.memory.summarize(); }
  resetMemory(): void { this.memory.clear(); }
}

// herramientas
class CalculatorTool implements Tool {
  name = 'calculator';
  async execute(input: string): Promise<string> {
    const match = input.match(/calcular\s+([\d+\-*/.() ]+)/i);
    if (!match) return 'No se pudo extraer expresión matemática.';
    try {
      const result = Function(`"use strict"; return (${match[1]})`)();
      return `Resultado: ${result}`;
    } catch (e) { return `Error: ${e}`; }
  }
}
class WebSearchTool implements Tool {
  name = 'web_search';
  async execute(input: string): Promise<string> {
    const query = input.replace(/buscar\s+/i, '').trim();
    return `Resultados de búsqueda para "${query}": (simulados)`;
  }
}
class DatabaseQueryTool implements Tool {
  name = 'db_query';
  async execute(input: string): Promise<string> {
    const match = input.match(/consulta\s+(.+)/i);
    const query = match ? match[1] : 'SELECT * FROM users';
    return `Ejecutando consulta: ${query}\nResultados simulados: 10 filas.`;
  }
}

// Guardrail
class SafetyGuardrail implements Guardrail {
  name = 'Safety';
  async validate(action: string, _context: any): Promise<{ allowed: boolean; reason?: string }> {
    const dangerous = ['drop table', 'delete', 'shutdown', 'rm -rf'];
    const lowerAction = action.toLowerCase();
    for (const word of dangerous) {
      if (lowerAction.includes(word)) {
        return { allowed: false, reason: `Acción peligrosa detectada: "${word}"` };
      }
    }
    return { allowed: true };
  }
}

// Orquestadores
interface Orchestrator {
  execute(agents: Agent[], initialInput: string): Promise<string>;
}

class SequentialOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    let input = initialInput;
    for (const agent of agents) {
      console.log(`[Sequential] Running ${agent.id} (${agent.role})`);
      input = await agent.process(input);
      console.log(`[Sequential] Output:`, input);
    }
    return input;
  }
}

class ConcurrentOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    const results = await Promise.all(agents.map(async (a) => {
      const res = await a.process(initialInput);
      return `[${a.role}]: ${res}`;
    }));
    return `Concurrent results:\n${results.join('\n')}`;
  }
}

class HandoffOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    let input = initialInput;
    for (const agent of agents) {
      console.log(`[Handoff] Passing to ${agent.id} (${agent.role})`);
      if (await this.decideToHandle(agent, input)) {
        input = await agent.process(input);
        console.log(`[Handoff] Handled by ${agent.role}`);
        return input;
      }
    }
    return `No agent could handle: ${initialInput}`;
  }
  private async decideToHandle(agent: Agent, input: string): Promise<boolean> {
    const role = agent.role.toLowerCase();
    const words = input.toLowerCase().split(' ');
    for (const w of words) { if (role.includes(w) || w.includes(role)) return true; }
    const mem = agent.shareMemory();
    return mem && mem.length > 5 ? Math.random() > 0.5 : false;
  }
}

class HierarchicalOrchestrator implements Orchestrator {
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    if (agents.length === 0) return 'No agents';
    const manager = agents[0];
    const workers = agents.slice(1);
    console.log(`[Hierarchical] Manager ${manager.id} decomposes task`);
    const decomposition = await manager.process(`Decompose this task: ${initialInput}`);
    const subtasks = this.parseSubtasks(decomposition, workers.length);
    const workerResults = await Promise.all(workers.map((w, i) => {
      const subtask = subtasks[i] || `Subtask ${i+1}`;
      console.log(`[Hierarchical] Worker ${w.id} (${w.role}) processing: "${subtask}"`);
      return w.process(subtask);
    }));
    const synthesis = await manager.process(`Synthesize these results:\n${workerResults.join('\n')}`);
    return synthesis;
  }
  private parseSubtasks(decomp: string, num: number): string[] {
    const lines = decomp.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= num) return lines.slice(0, num);
    const result: string[] = [];
    for (let i = 0; i < num; i++) result.push(lines[i] || `Subtask ${i+1}`);
    return result;
  }
}

class GroupChatOrchestrator implements Orchestrator {
  private maxRounds: number;
  constructor(maxRounds: number = 3) { this.maxRounds = maxRounds; }
  async execute(agents: Agent[], initialInput: string): Promise<string> {
    console.log(`[GroupChat] Debate con ${agents.length} agentes, ${this.maxRounds} rondas`);
    let context = initialInput;
    const allMessages: string[] = [];
    for (let round = 0; round < this.maxRounds; round++) {
      console.log(`[GroupChat] Ronda ${round + 1}`);
      const roundContrib: string[] = [];
      for (const agent of agents) {
        const prompt = round === 0 ? context : `${initialInput}\nOpiniones previas: ${context}`;
        const response = await agent.process(prompt);
        roundContrib.push(`[${agent.role}]: ${response}`);
        console.log(`[${agent.role}]: ${response}`);
      }
      allMessages.push(...roundContrib);
      if (this.checkConsensus(roundContrib)) {
        return `✅ Consenso en ronda ${round+1}:\n${roundContrib.join('\n')}`;
      }
      context = roundContrib.join('\n');
    }
    return `Sin consenso tras ${this.maxRounds} rondas.\n${allMessages.join('\n')}`;
  }
  private checkConsensus(messages: string[]): boolean {
    const lower = messages.map(m => m.toLowerCase());
    const agree = lower.filter(m => m.includes('de acuerdo') || m.includes('agree')).length;
    return agree >= messages.length / 2;
  }
}

// ejemplo de uso
async function main() {
  const tools = new ToolRegistry();
  tools.register(new CalculatorTool());
  tools.register(new WebSearchTool());
  tools.register(new DatabaseQueryTool());
  const guards = new GuardrailRegistry();
  guards.add(new SafetyGuardrail());

  const agent1 = new Agent('A1', 'Matemático', tools, guards);
  const agent2 = new Agent('A2', 'Investigador', tools, guards);
  const agent3 = new Agent('A3', 'Analista de datos', tools, guards);
  const agent4 = new Agent('A4', 'Coordinador', tools, guards);

  console.log('=== DEMOSTRACIÓN DE ORQUESTACIÓN DE AGENTES ===\n');

  // 1. Secuencial
  console.log('--- 1. SECUENCIAL ---');
  const seq = new SequentialOrchestrator();
  const r1 = await seq.execute([agent1, agent2, agent3], 'Calcular área de círculo radio 5 y buscar usos en arquitectura.');
  console.log('Resultado:', r1, '\n');

  // Resetear memorias
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 2. Concurrente
  console.log('--- 2. CONCURRENTE ---');
  const conc = new ConcurrentOrchestrator();
  const r2 = await conc.execute([agent1, agent2, agent3], 'Evaluar IA: matemáticas, investigación y datos.');
  console.log(r2, '\n');
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 3. Handoff
  console.log('--- 3. HANDOFF (Chain of Responsibility) ---');
  const hand = new HandoffOrchestrator();
  const r3 = await hand.execute([agent1, agent2, agent3], 'Necesito análisis matemático de f(x)=x^2+2x+1');
  console.log('Resultado:', r3, '\n');
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 4. Jerárquico
  console.log('--- 4. JERÁRQUICO ---');
  const hier = new HierarchicalOrchestrator();
  const r4 = await hier.execute([agent4, agent1, agent2, agent3], 'Crear informe sobre IA en medicina.');
  console.log('Resultado:', r4, '\n');
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 5. Grupo de debate
  console.log('--- 5. GRUPO DE DEBATE ---');
  const chat = new GroupChatOrchestrator(3);
  const r5 = await chat.execute([agent1, agent2, agent3], '¿Debemos usar IA para diagnosticar enfermedades?');
  console.log('Resultado:', r5, '\n');

  // 6. Guardrail
  console.log('--- 6. DEMOSTRACIÓN DE GUARDRAIL ---');
  const dangerousAgent = new Agent('D1', 'Hacker', tools, guards);
  try {
    await dangerousAgent.process('rm -rf /');
  } catch (e) {
    console.log('✅ Guardrail bloqueó:', (e as Error).message);
  }
}
main().catch(console.error);
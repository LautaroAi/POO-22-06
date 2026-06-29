import { Memory } from './Memory';
import { ToolRegistry } from './Tool';
import { GuardrailRegistry } from './Guardrail';

export interface AgentConfig {
  id: string;
  role: string;
  systemPrompt?: string;
}

export class Agent {
  public id: string;
  public role: string;
  public memory: Memory;
  private tools: ToolRegistry;
  private guards: GuardrailRegistry;
  private systemPrompt: string;

  constructor(config: AgentConfig, tools?: ToolRegistry, guards?: GuardrailRegistry) {
    this.id = config.id;
    this.role = config.role;
    this.memory = new Memory();
    this.tools = tools || new ToolRegistry();
    this.guards = guards || new GuardrailRegistry();
    this.systemPrompt = config.systemPrompt || `You are a ${this.role} agent.`;
  }

  async process(input: string): Promise<string> {
    await this.guards.check(input, { agent: this.id, input });
    this.memory.addThought(`Input: ${input}`);

    const lower = input.toLowerCase();

    // Detectar debate o pregunta sobre IA/diagnóstico
    if (lower.includes('debemos') || lower.includes('diagnosticar') || lower.includes('enfermedades')) {
      const opinion = this.generateOpinion(input);
      this.memory.addThought(`Opinion: ${opinion}`);
      return opinion;
    }

    // Herramientas
    const toolDecision = this.decideTool(input);
    if (toolDecision) {
      try {
        const result = await this.executeTool(toolDecision.toolName, toolDecision.input);
        this.memory.addThought(`Tool result: ${result}`);
        return result;
      } catch (e) {
        return `Error al usar herramienta: ${e}`;
      }
    }

    // Respuesta genérica
    const response = `[${this.role}] procesa: "${input.substring(0, 40)}..."`;
    this.memory.addThought(`Response: ${response}`);
    return response;
  }

  // Genera opinión adaptada al contexto (incluye opiniones previas si existen)
  private generateOpinion(input: string): string {
    const role = this.role;
    const hasPrevious = input.includes('Opiniones previas:');
    let previous = '';
    if (hasPrevious) {
      previous = input.split('Opiniones previas:')[1]?.substring(0, 100) || '';
    }

    // Opinión base por rol
    let baseOpinion = '';
    if (role === 'Matemático') {
      baseOpinion = 'Como matemático, creo que la IA puede ser precisa si los modelos están bien entrenados, pero siempre hay margen de error.';
    } else if (role === 'Investigador') {
      baseOpinion = 'Desde la investigación, veo que la IA ya supera a médicos en ciertos diagnósticos, pero faltan estudios a largo plazo.';
    } else if (role === 'Analista de datos') {
      baseOpinion = 'Los datos muestran que la IA reduce falsos negativos, pero la calidad de los datos es clave.';
    } else if (role === 'Coordinador') {
      baseOpinion = 'Como coordinador, recomiendo un enfoque híbrido: IA + supervisión médica.';
    } else {
      baseOpinion = `[${role}] opina: (sin opinión específica)`;
    }

    // Si hay opiniones previas, ajustar ligeramente la respuesta
    if (hasPrevious && previous.length > 0) {
      // Simular que el agente escucha y matiza su postura
      if (role === 'Matemático') {
        if (previous.includes('datos') || previous.includes('investigación')) {
          return `Como matemático, coincido en que los datos son importantes, pero insisto en que el modelo debe ser validado rigurosamente.`;
        }
        return `Como matemático, mantengo que la IA debe ser precisa, pero veo que otros aspectos también importan.`;
      }
      if (role === 'Investigador') {
        if (previous.includes('matemático') || previous.includes('datos')) {
          return `Como investigador, valoro el rigor matemático y los datos; la evidencia crece, pero la prudencia es necesaria.`;
        }
        return `Como investigador, reafirmo que la IA es prometedora, pero faltan más ensayos clínicos.`;
      }
      if (role === 'Analista de datos') {
        if (previous.includes('investigación') || previous.includes('modelos')) {
          return `Los datos respaldan la IA, pero concuerdo en que se necesitan más estudios y validación.`;
        }
        return `Los datos son claros: la IA es útil, pero no infalible.`;
      }
      if (role === 'Coordinador') {
        return `Como coordinador, veo que hay consenso en que la IA ayuda, pero debe ser supervisada.`;
      }
    }

    return baseOpinion;
  }

  private decideTool(input: string): { toolName: string; input: string; action: string } | null {
    const lower = input.toLowerCase();
    const available = this.tools.list();
    if (lower.includes('calcular') && available.includes('calculator')) {
      return { toolName: 'calculator', input, action: 'calculate' };
    }
    if (lower.includes('buscar') && available.includes('web_search')) {
      return { toolName: 'web_search', input, action: 'search' };
    }
    if (lower.includes('base de datos') && available.includes('db_query')) {
      return { toolName: 'db_query', input, action: 'query' };
    }
    return null;
  }

  private async executeTool(toolName: string, input: string): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);
    return await tool.execute(input);
  }

  shareMemory(): string {
    return this.memory.summarize();
  }

  resetMemory(): void {
    this.memory.clear();
  }
}
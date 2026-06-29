import { Agent } from '../core/Agent';
import { ToolRegistry } from '../core/Tool';
import { GuardrailRegistry } from '../core/Guardrail';
import { SequentialOrchestrator } from '../orchestrators/SequentialOrchestrator';
import { ConcurrentOrchestrator } from '../orchestrators/ConcurrentOrchestrator';
import { HandoffOrchestrator } from '../orchestrators/HandoffOrchestrator';
import { CalculatorTool } from '../tools/CalculatorTool';
import { SafetyGuardrail } from '../guards/SafetyGuardrail';

describe('Agentic Orchestration', () => {
  let tools: ToolRegistry;
  let guards: GuardrailRegistry;
  let agent1: Agent;
  let agent2: Agent;

  beforeEach(() => {
    tools = new ToolRegistry();
    tools.register(new CalculatorTool());
    guards = new GuardrailRegistry();
    guards.add(new SafetyGuardrail());
    agent1 = new Agent({ id: 'A1', role: 'Matemático' }, tools, guards);
    agent2 = new Agent({ id: 'A2', role: 'Investigador' }, tools, guards);
  });

  it('should execute sequential orchestration', async () => {
    const orch = new SequentialOrchestrator();
    const result = await orch.execute([agent1, agent2], 'calcular 2+2');
    expect(result).toContain('Resultado');
  });

  it('should execute concurrent orchestration', async () => {
    const orch = new ConcurrentOrchestrator();
    const result = await orch.execute([agent1, agent2], 'procesar datos');
    expect(result).toContain('Concurrent results');
  });

  it('should handoff to appropriate agent', async () => {
    const orch = new HandoffOrchestrator();
    const result = await orch.execute([agent1, agent2], 'necesito calcular algo');
    // El matemático debería manejar
    expect(result).toContain('Matemático');
  });

  it('should block dangerous action with guardrail', async () => {
    const guard = new SafetyGuardrail();
    const validation = await guard.validate('rm -rf /', {});
    expect(validation.allowed).toBe(false);
  });
});
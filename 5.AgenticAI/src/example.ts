import { Agent } from './core/Agent';
import { ToolRegistry } from './core/Tool';
import { GuardrailRegistry } from './core/Guardrail';
import { SequentialOrchestrator } from './orchestrators/SequentialOrchestrator';
import { ConcurrentOrchestrator } from './orchestrators/ConcurrentOrchestrator';
import { HandoffOrchestrator } from './orchestrators/HandoffOrchestrator';
import { HierarchicalOrchestrator } from './orchestrators/HierarchicalOrchestrator';
import { GroupChatOrchestrator } from './orchestrators/GroupChatOrchestrator';
import { CalculatorTool } from './tools/CalculatorTool';
import { WebSearchTool } from './tools/WebSearchTool';
import { DatabaseQueryTool } from './tools/DatabaseQueryTool';
import { SafetyGuardrail } from './guards/SafetyGuardrail';

async function main() {
  // Configurar herramientas y guardrails globales
  const tools = new ToolRegistry();
  tools.register(new CalculatorTool());
  tools.register(new WebSearchTool());
  tools.register(new DatabaseQueryTool());

  const guards = new GuardrailRegistry();
  guards.add(new SafetyGuardrail());

  // Crear agentes con diferentes roles
  const agent1 = new Agent({ id: 'A1', role: 'Matemático' }, tools, guards);
  const agent2 = new Agent({ id: 'A2', role: 'Investigador' }, tools, guards);
  const agent3 = new Agent({ id: 'A3', role: 'Analista de datos' }, tools, guards);
  const agent4 = new Agent({ id: 'A4', role: 'Coordinador' }, tools, guards);

  console.log('=== DEMOSTRACIÓN DE ORQUESTACIÓN DE AGENTES ===\n');

  // 1. Secuencial
  console.log('--- 1. ORQUESTADOR SECUENCIAL ---');
  const seqOrch = new SequentialOrchestrator();
  const seqResult = await seqOrch.execute(
    [agent1, agent2, agent3],
    'Calcular el área de un círculo de radio 5 y luego buscar su uso en arquitectura.'
  );
  console.log('Resultado final secuencial:', seqResult);
  console.log('\n');

  // Resetear memorias para nuevo ejemplo
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 2. Concurrente
  console.log('--- 2. ORQUESTADOR CONCURRENTE ---');
  const concOrch = new ConcurrentOrchestrator();
  const concResult = await concOrch.execute(
    [agent1, agent2, agent3],
    'Evaluar diferentes aspectos de la inteligencia artificial: matemáticas, investigación y datos.'
  );
  console.log(concResult);
  console.log('\n');

  // Resetear
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 3. Handoff (Chain of Responsibility)
  console.log('--- 3. ORQUESTADOR HANDOFF ---');
  const handoffOrch = new HandoffOrchestrator();
  const handoffResult = await handoffOrch.execute(
    [agent1, agent2, agent3],
    'Necesito un análisis matemático de esta función: f(x)=x^2+2x+1'
  );
  console.log('Resultado handoff:', handoffResult);
  console.log('\n');

  // Resetear
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 4. Jerárquico (Manager-Worker)
  console.log('--- 4. ORQUESTADOR JERÁRQUICO ---');
  const hierOrch = new HierarchicalOrchestrator();
  const hierResult = await hierOrch.execute(
    [agent4, agent1, agent2, agent3], // agente4 es manager
    'Crear un informe sobre el impacto del machine learning en la medicina.'
  );
  console.log('Resultado jerárquico:', hierResult);
  console.log('\n');

  // Resetear
  [agent1, agent2, agent3, agent4].forEach(a => a.resetMemory());

  // 5. Grupo de debate
  console.log('--- 5. ORQUESTADOR GRUPO DE DEBATE ---');
  const chatOrch = new GroupChatOrchestrator(3); // 3 rondas máximas
  const chatResult = await chatOrch.execute(
    [agent1, agent2, agent3],
    '¿Debemos usar IA para diagnosticar enfermedades?'
  );
  console.log('Resultado del debate:', chatResult);
  console.log('\n');

  // 6. Demostración de guardrail bloqueando acción peligrosa
  console.log('--- 6. DEMOSTRACIÓN DE GUARDRAIL ---');
  const dangerousAgent = new Agent({ id: 'D1', role: 'Hacker' }, tools, guards);
  try {
    const badResult = await dangerousAgent.process('Ejecutar comando: rm -rf /');
    console.log('Resultado inesperado:', badResult);
  } catch (error) {
    console.log('✅ Guardrail bloqueó la acción:', (error as Error).message);
  }
}

main().catch(console.error);
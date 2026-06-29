import { Guardrail } from '../core/Guardrail';

export class SafetyGuardrail implements Guardrail {
  name = 'Safety';

  async validate(action: string, context: any): Promise<{ allowed: boolean; reason?: string }> {
    // Bloquear acciones peligrosas simuladas
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
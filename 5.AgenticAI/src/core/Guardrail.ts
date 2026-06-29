export interface Guardrail {
  name: string;
  validate(action: string, context: any): Promise<{ allowed: boolean; reason?: string }>;
}

export class GuardrailRegistry {
  private guards: Guardrail[] = [];

  add(guard: Guardrail): void {
    this.guards.push(guard);
  }

  async check(action: string, context: any): Promise<void> {
    for (const guard of this.guards) {
      const result = await guard.validate(action, context);
      if (!result.allowed) {
        throw new Error(`Guardrail "${guard.name}" blocked action: ${result.reason}`);
      }
    }
  }
}
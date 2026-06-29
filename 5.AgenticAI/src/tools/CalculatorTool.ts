import { Tool } from '../core/Tool';

export class CalculatorTool implements Tool {
  name = 'calculator';

  async execute(input: string): Promise<string> {
    // Extraer expresión después de "calcular"
    const match = input.match(/calcular\s+([\d+\-*/.() ]+)/i);
    if (!match) {
      return 'No se pudo extraer una expresión matemática.';
    }
    try {
      // Evaluar de forma segura (solo para simulación)
      const result = Function(`"use strict"; return (${match[1]})`)();
      return `Resultado: ${result}`;
    } catch (e) {
      return `Error al calcular: ${e}`;
    }
  }
}
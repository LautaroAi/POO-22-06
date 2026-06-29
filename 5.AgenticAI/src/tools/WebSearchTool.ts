import { Tool } from '../core/Tool';

export class WebSearchTool implements Tool {
  name = 'web_search';

  async execute(input: string): Promise<string> {
    // Simular búsqueda web
    const query = input.replace(/buscar\s+/i, '').trim();
    return `Resultados de búsqueda para "${query}": (simulados) ...`;
  }
}
import { Tool } from '../core/Tool';

export class DatabaseQueryTool implements Tool {
  name = 'db_query';

  async execute(input: string): Promise<string> {
    // Simular consulta SQL
    const match = input.match(/consulta\s+(.+)/i);
    const query = match ? match[1] : 'SELECT * FROM users';
    return `Ejecutando consulta: ${query}\nResultados simulados: 10 filas.`;
  }
}
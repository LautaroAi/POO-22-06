export class Memory {
  private thoughts: string[] = [];

  addThought(thought: string): void {
    this.thoughts.push(thought);
  }

  getThoughts(): string[] {
    return [...this.thoughts];
  }

  clear(): void {
    this.thoughts = [];
  }

  summarize(): string {
    return this.thoughts.join(' → ');
  }
}
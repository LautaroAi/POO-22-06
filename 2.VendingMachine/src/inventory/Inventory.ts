import { Item } from '../models/Item';
import { Denomination } from '../models/Denomination';

export class Inventory {
  private items: Map<string, Item> = new Map();
  private cashBox: Map<Denomination, number> = new Map();

  // Array fijo de todas las denominaciones (solo números, sin strings)
  private readonly denominations: Denomination[] = [
    Denomination.PENNY,
    Denomination.NICKEL,
    Denomination.DIME,
    Denomination.QUARTER,
    Denomination.DOLLAR,
    Denomination.FIVE,
    Denomination.TEN,
    Denomination.TWENTY
  ];

  constructor() {
    // Inicializar caja con 10 unidades de cada denominación
    for (const denom of this.denominations) {
      this.cashBox.set(denom, 10);
    }
  }

  // --- Productos ---
  addItem(item: Item): void {
    this.items.set(item.code, item);
  }

  getItem(code: string): Item | undefined {
    return this.items.get(code);
  }

  hasStock(code: string): boolean {
    const item = this.items.get(code);
    return item ? item.quantity > 0 : false;
  }

  decreaseStock(code: string): boolean {
    const item = this.items.get(code);
    if (!item || item.quantity <= 0) return false;
    item.quantity--;
    return true;
  }

  // --- Dinero ---
  addCash(denom: Denomination, count: number): void {
    const current = this.cashBox.get(denom) || 0;
    this.cashBox.set(denom, current + count);
  }

  getCash(denom: Denomination): number {
    return this.cashBox.get(denom) || 0;
  }

  canMakeChange(amount: number): boolean {
    let remaining = Math.round(amount * 100);
    // Orden descendente de denominaciones (solo las que no excedan el monto)
    const sortedDenoms = this.denominations
      .filter(d => d <= amount)
      .sort((a, b) => b - a);

    for (const denom of sortedDenoms) {
      const denomCents = Math.round(denom * 100);
      const available = this.cashBox.get(denom) || 0;
      const needed = Math.floor(remaining / denomCents);
      const toUse = Math.min(needed, available);
      remaining -= toUse * denomCents;
      if (remaining === 0) return true;
    }
    return remaining === 0;
  }

  dispenseChange(amount: number): Map<Denomination, number> {
    const change = new Map<Denomination, number>();
    let remaining = Math.round(amount * 100);
    const sortedDenoms = this.denominations
      .filter(d => d <= amount)
      .sort((a, b) => b - a);

    for (const denom of sortedDenoms) {
      const denomCents = Math.round(denom * 100);
      const available = this.cashBox.get(denom) || 0;
      const needed = Math.floor(remaining / denomCents);
      const toUse = Math.min(needed, available);
      if (toUse > 0) {
        change.set(denom, toUse);
        this.cashBox.set(denom, available - toUse);
        remaining -= toUse * denomCents;
      }
      if (remaining === 0) break;
    }

    if (remaining !== 0) {
      throw new Error('No se puede dar el cambio exacto');
    }
    return change;
  }
}
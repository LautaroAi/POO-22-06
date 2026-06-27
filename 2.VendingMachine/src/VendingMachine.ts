import { State } from './states/State';
import { IdleState } from './states/IdleState';
import { Inventory } from './inventory/Inventory';
import { Denomination } from './models/Denomination';

export class VendingMachine {
  private static instance: VendingMachine;
  private state: State;
  private inventory: Inventory;
  private selectedProduct: string | null = null;
  private currentMoney: number = 0;
  private currentMoneyMap: Map<Denomination, number> = new Map();
  private isLocked: boolean = false; // para simular atomicidad

  private constructor() {
    this.inventory = new Inventory();
    this.state = new IdleState();
  }

  static getInstance(): VendingMachine {
    if (!VendingMachine.instance) {
      VendingMachine.instance = new VendingMachine();
    }
    return VendingMachine.instance;
  }

  // --- Delegación de acciones ---
  selectProduct(code: string): void {
    this.state.selectProduct(code, this);
  }

  insertMoney(denom: Denomination): void {
    this.state.insertMoney(denom, this);
  }

  cancel(): void {
    this.state.cancel(this);
  }

  dispense(): void {
    this.state.dispense(this);
  }

  // --- Getters / Setters para el contexto ---
  setState(state: State): void {
    this.state = state;
  }

  getInventory(): Inventory {
    return this.inventory;
  }

  setSelectedProduct(code: string | null): void {
    this.selectedProduct = code;
  }

  getSelectedProduct(): string | null {
    return this.selectedProduct;
  }

  addMoney(denom: Denomination): void {
    this.currentMoney += denom;
    const current = this.currentMoneyMap.get(denom) || 0;
    this.currentMoneyMap.set(denom, current + 1);
  }

  getCurrentMoney(): number {
    return this.currentMoney;
  }

  getCurrentMoneyMap(): Map<Denomination, number> {
    return new Map(this.currentMoneyMap);
  }

  clearMoney(): void {
    this.currentMoney = 0;
    this.currentMoneyMap.clear();
  }

  returnMoney(): void {
    console.log(`Devolviendo $${this.currentMoney.toFixed(2)}`);
    this.clearMoney();
  }

  // Método para transacciones atómicas (simulación)
  async executeTransaction<T>(fn: () => T): Promise<T> {
    if (this.isLocked) {
      throw new Error('La máquina está ocupada');
    }
    this.isLocked = true;
    try {
      return fn();
    } finally {
      this.isLocked = false;
    }
  }
}
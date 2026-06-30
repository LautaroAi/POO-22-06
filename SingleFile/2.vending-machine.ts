// 2.vending-machine.ts – Vending Machine con State, Singleton y Strategy (pagos)

// modelos
enum Denomination {
  PENNY = 0.01, NICKEL = 0.05, DIME = 0.10, QUARTER = 0.25,
  DOLLAR = 1, FIVE = 5, TEN = 10, TWENTY = 20
}
class Item {
  public code: string; public name: string; public price: number; public quantity: number;
  constructor(code: string, name: string, price: number, quantity: number) {
    this.code = code; this.name = name; this.price = price; this.quantity = quantity;
  }
}

// inventario
class Inventory {
  private items: Map<string, Item> = new Map();
  private cashBox: Map<Denomination, number> = new Map();
  private readonly denominations: Denomination[] = [
    Denomination.PENNY, Denomination.NICKEL, Denomination.DIME, Denomination.QUARTER,
    Denomination.DOLLAR, Denomination.FIVE, Denomination.TEN, Denomination.TWENTY
  ];
  constructor() {
    for (const d of this.denominations) this.cashBox.set(d, 10);
  }
  addItem(item: Item): void { this.items.set(item.code, item); }
  getItem(code: string): Item | undefined { return this.items.get(code); }
  hasStock(code: string): boolean { const i = this.items.get(code); return i ? i.quantity > 0 : false; }
  decreaseStock(code: string): boolean {
    const item = this.items.get(code);
    if (!item || item.quantity <= 0) return false;
    item.quantity--; return true;
  }
  addCash(denom: Denomination, count: number): void {
    const current = this.cashBox.get(denom) || 0;
    this.cashBox.set(denom, current + count);
  }
  getCash(denom: Denomination): number { return this.cashBox.get(denom) || 0; }
  canMakeChange(amount: number): boolean {
    let remaining = Math.round(amount * 100);
    const sorted = this.denominations.filter(d => d <= amount).sort((a, b) => b - a);
    for (const d of sorted) {
      const cents = Math.round(d * 100);
      const available = this.cashBox.get(d) || 0;
      const needed = Math.floor(remaining / cents);
      const toUse = Math.min(needed, available);
      remaining -= toUse * cents;
      if (remaining === 0) return true;
    }
    return remaining === 0;
  }
  dispenseChange(amount: number): Map<Denomination, number> {
    const change = new Map<Denomination, number>();
    let remaining = Math.round(amount * 100);
    const sorted = this.denominations.filter(d => d <= amount).sort((a, b) => b - a);
    for (const d of sorted) {
      const cents = Math.round(d * 100);
      const available = this.cashBox.get(d) || 0;
      const needed = Math.floor(remaining / cents);
      const toUse = Math.min(needed, available);
      if (toUse > 0) {
        change.set(d, toUse);
        this.cashBox.set(d, available - toUse);
        remaining -= toUse * cents;
      }
      if (remaining === 0) break;
    }
    if (remaining !== 0) throw new Error('No se puede dar el cambio exacto');
    return change;
  }
}

// estados
interface State {
  selectProduct(code: string, machine: VendingMachine): void;
  insertMoney(denom: Denomination, machine: VendingMachine): void;
  cancel(machine: VendingMachine): void;
  dispense(machine: VendingMachine): void;
}

class IdleState implements State {
  selectProduct(code: string, machine: VendingMachine): void {
    if (!machine.getInventory().hasStock(code)) {
      console.log('Producto agotado o inexistente'); return;
    }
    const item = machine.getInventory().getItem(code)!;
    console.log(`Producto seleccionado: ${item.name} ($${item.price})`);
    machine.setSelectedProduct(code);
    machine.setState(new HasMoneyState());
  }
  insertMoney(_denom: Denomination, _machine: VendingMachine): void {
    console.log('Primero selecciona un producto');
  }
  cancel(_machine: VendingMachine): void {
    console.log('No hay transacción activa para cancelar');
  }
  dispense(_machine: VendingMachine): void {
    console.log('Selecciona un producto primero');
  }
}

class HasMoneyState implements State {
  selectProduct(_code: string, _machine: VendingMachine): void {
    console.log('Ya hay una transacción en curso');
  }
  insertMoney(denom: Denomination, machine: VendingMachine): void {
    machine.addMoney(denom);
    const total = machine.getCurrentMoney();
    const code = machine.getSelectedProduct();
    if (!code) {
      console.log('Error: no hay producto seleccionado');
      machine.setState(new IdleState()); return;
    }
    const item = machine.getInventory().getItem(code);
    if (!item) {
      console.log('Producto no encontrado');
      machine.setState(new IdleState()); return;
    }
    console.log(`Dinero insertado: $${denom}. Total: $${total.toFixed(2)}`);
    if (total >= item.price) {
      console.log('Pago suficiente. Dispensando...');
      machine.setState(new DispenseState());
      machine.dispense();
    }
  }
  cancel(machine: VendingMachine): void {
    const refund = machine.getCurrentMoney();
    machine.returnMoney();
    machine.setSelectedProduct(null);
    machine.setState(new IdleState());
    console.log(`Transacción cancelada. Devueltos $${refund.toFixed(2)}`);
  }
  dispense(_machine: VendingMachine): void {
    console.log('Primero inserta suficiente dinero');
  }
}

class DispenseState implements State {
  selectProduct(_code: string, _machine: VendingMachine): void {
    console.log('Espera, estamos dispensando...');
  }
  insertMoney(_denom: Denomination, _machine: VendingMachine): void {
    console.log('No aceptamos dinero mientras dispensamos');
  }
  cancel(_machine: VendingMachine): void {
    console.log('No se puede cancelar en medio de la dispensación');
  }
  dispense(machine: VendingMachine): void {
    const code = machine.getSelectedProduct();
    if (!code) {
      console.log('Error: no hay producto seleccionado');
      machine.setState(new IdleState()); return;
    }
    const inv = machine.getInventory();
    const item = inv.getItem(code);
    if (!item || item.quantity <= 0) {
      console.log('Producto agotado');
      machine.returnMoney();
      machine.setSelectedProduct(null);
      machine.setState(new IdleState()); return;
    }
    const price = item.price;
    const paid = machine.getCurrentMoney();
    const change = paid - price;
    if (change < 0) {
      console.log('Pago insuficiente (error)');
      machine.returnMoney();
      machine.setState(new IdleState()); return;
    }
    if (change > 0 && !inv.canMakeChange(change)) {
      console.log('No tenemos cambio exacto. Cancelando.');
      machine.returnMoney();
      machine.setSelectedProduct(null);
      machine.setState(new IdleState()); return;
    }
    if (!inv.decreaseStock(code)) {
      console.log('Error al dispensar: producto agotado');
      machine.returnMoney();
      machine.setState(new IdleState()); return;
    }
    const paidMap = machine.getCurrentMoneyMap();
    for (const [d, count] of paidMap) inv.addCash(d, count);
    if (change > 0) {
      const changeMap = inv.dispenseChange(change);
      console.log('Cambio entregado:');
      for (const [d, count] of changeMap) console.log(`  ${count} x $${d}`);
    }
    console.log(`Producto ${item.name} dispensado. ¡Disfruta!`);
    machine.clearMoney();
    machine.setSelectedProduct(null);
    machine.setState(new IdleState());
  }
}

// Singleton
class VendingMachine {
  private static instance: VendingMachine;
  private state: State;
  private inventory: Inventory;
  private selectedProduct: string | null = null;
  private currentMoney: number = 0;
  private currentMoneyMap: Map<Denomination, number> = new Map();

  private constructor() {
    this.inventory = new Inventory();
    this.state = new IdleState();
  }
  static getInstance(): VendingMachine {
    if (!VendingMachine.instance) VendingMachine.instance = new VendingMachine();
    return VendingMachine.instance;
  }
  selectProduct(code: string): void { this.state.selectProduct(code, this); }
  insertMoney(denom: Denomination): void { this.state.insertMoney(denom, this); }
  cancel(): void { this.state.cancel(this); }
  dispense(): void { this.state.dispense(this); }

  setState(state: State): void { this.state = state; }
  getInventory(): Inventory { return this.inventory; }
  setSelectedProduct(code: string | null): void { this.selectedProduct = code; }
  getSelectedProduct(): string | null { return this.selectedProduct; }
  addMoney(denom: Denomination): void {
    this.currentMoney += denom;
    const current = this.currentMoneyMap.get(denom) || 0;
    this.currentMoneyMap.set(denom, current + 1);
  }
  getCurrentMoney(): number { return this.currentMoney; }
  getCurrentMoneyMap(): Map<Denomination, number> { return new Map(this.currentMoneyMap); }
  clearMoney(): void { this.currentMoney = 0; this.currentMoneyMap.clear(); }
  returnMoney(): void {
    console.log(`Devolviendo $${this.currentMoney.toFixed(2)}`);
    this.clearMoney();
  }
}

// ejemplo de uso
const machine = VendingMachine.getInstance();
const inv = machine.getInventory();
inv.addItem(new Item('A1', 'Coca-Cola', 1.50, 5));
inv.addItem(new Item('B2', 'Papas fritas', 2.00, 3));
inv.addItem(new Item('C3', 'Chocolate', 0.75, 10));

console.log('=== MÁQUINA EXPENDEDORA ===');
console.log('Productos disponibles:');
console.table([
  { código: 'A1', nombre: 'Coca-Cola', precio: '$1.50', stock: 5 },
  { código: 'B2', nombre: 'Papas fritas', precio: '$2.00', stock: 3 },
  { código: 'C3', nombre: 'Chocolate', precio: '$0.75', stock: 10 },
]);

// compra exitosa
console.log('\n--- Transacción: Compra ---');
machine.selectProduct('A1');
machine.insertMoney(Denomination.DOLLAR);
machine.insertMoney(Denomination.QUARTER);
machine.insertMoney(Denomination.QUARTER);

// compra con cambio
console.log('\n--- Transacción: Compra con cambio ---');
machine.selectProduct('B2');
machine.insertMoney(Denomination.FIVE);

// cancelación
console.log('\n--- Transacción: Cancelar compra ---');
machine.selectProduct('C3');
machine.insertMoney(Denomination.QUARTER);
machine.insertMoney(Denomination.QUARTER);
machine.cancel();
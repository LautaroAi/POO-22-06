import { VendingMachine } from '../VendingMachine';
import { Denomination } from '../models/Denomination';
import { Item } from '../models/Item';

describe('VendingMachine', () => {
  let machine: VendingMachine;

  beforeEach(() => {
    machine = VendingMachine.getInstance();
    const inv = machine.getInventory();
    // Limpiar y resetear para cada prueba
    inv.addItem(new Item('A1', 'Cola', 1.50, 5));
    inv.addItem(new Item('B2', 'Chips', 2.00, 3));
    machine.clearMoney();
    machine.setSelectedProduct(null);
    machine.setState(new (require('../states/IdleState').IdleState)());
  });

  it('should dispense product when exact money is inserted', () => {
    machine.selectProduct('A1');
    machine.insertMoney(Denomination.DOLLAR);
    machine.insertMoney(Denomination.QUARTER);
    machine.insertMoney(Denomination.QUARTER);
    // Después del dispense, debería estar en Idle
    const inv = machine.getInventory();
    expect(inv.getItem('A1')?.quantity).toBe(4);
  });

  it('should return change when overpaying', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    machine.selectProduct('B2');
    machine.insertMoney(Denomination.FIVE);
    // Debe dar $3 de cambio
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cambio entregado:'));
    const inv = machine.getInventory();
    expect(inv.getItem('B2')?.quantity).toBe(2);
  });

  it('should cancel transaction and return money', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    machine.selectProduct('C3');
    machine.insertMoney(Denomination.QUARTER);
    machine.insertMoney(Denomination.QUARTER);
    machine.cancel();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Devueltos $0.50'));
    expect(machine.getCurrentMoney()).toBe(0);
  });

  it('should not dispense if insufficient funds', () => {
    machine.selectProduct('A1');
    machine.insertMoney(Denomination.DOLLAR);
    // No alcanza, debería seguir en HasMoneyState
    const inv = machine.getInventory();
    expect(inv.getItem('A1')?.quantity).toBe(5);
  });

  it('should refuse if product out of stock', () => {
    const inv = machine.getInventory();
    const item = inv.getItem('A1');
    if (item) item.quantity = 0;
    machine.selectProduct('A1');
    machine.insertMoney(Denomination.DOLLAR);
    machine.insertMoney(Denomination.QUARTER);
    machine.insertMoney(Denomination.QUARTER);
    // No debe dispensar
    expect(inv.getItem('A1')?.quantity).toBe(0);
  });
});
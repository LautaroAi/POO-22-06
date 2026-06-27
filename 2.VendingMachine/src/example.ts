import { VendingMachine } from './VendingMachine';
import { Denomination } from './models/Denomination';
import { Item } from './models/Item';

// Configurar inventario inicial
const machine = VendingMachine.getInstance();
const inventory = machine.getInventory();

inventory.addItem(new Item('A1', 'Coca-Cola', 1.50, 5));
inventory.addItem(new Item('B2', 'Papas fritas', 2.00, 3));
inventory.addItem(new Item('C3', 'Chocolate', 0.75, 10));

console.log('=== MÁQUINA EXPENDEDORA ===');
console.log('Productos disponibles:');
console.table([
  { código: 'A1', nombre: 'Coca-Cola', precio: '$1.50', stock: 5 },
  { código: 'B2', nombre: 'Papas fritas', precio: '$2.00', stock: 3 },
  { código: 'C3', nombre: 'Chocolate', precio: '$0.75', stock: 10 },
]);

// Simular una compra exitosa
console.log('\n--- Transacción 1: Compra de Coca-Cola ---');
machine.selectProduct('A1');
machine.insertMoney(Denomination.DOLLAR);
machine.insertMoney(Denomination.QUARTER);
machine.insertMoney(Denomination.QUARTER); // total $1.50
// La máquina dispensará automáticamente

// Simular una compra con cambio
console.log('\n--- Transacción 2: Compra de papas con cambio ---');
machine.selectProduct('B2');
machine.insertMoney(Denomination.FIVE); // $5.00
// Debe dar $3.00 de cambio

// Simular cancelación
console.log('\n--- Transacción 3: Cancelación ---');
machine.selectProduct('C3');
machine.insertMoney(Denomination.QUARTER);
machine.insertMoney(Denomination.QUARTER);
machine.cancel(); // Devuelve $0.50

// Simular producto agotado
console.log('\n--- Transacción 4: Producto agotado ---');
machine.selectProduct('A1');
machine.insertMoney(Denomination.DOLLAR);
// No alcanza, debería pedir más dinero
machine.insertMoney(Denomination.QUARTER);
machine.insertMoney(Denomination.QUARTER);
// Ahora sí alcanza
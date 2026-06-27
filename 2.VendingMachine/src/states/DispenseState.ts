import { State } from './State';
import { VendingMachine } from '../VendingMachine';
import { Denomination } from '../models/Denomination';
import { IdleState } from './IdleState';

export class DispenseState implements State {
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
      machine.setState(new IdleState());
      return;
    }

    const inventory = machine.getInventory();
    const item = inventory.getItem(code);
    if (!item || item.quantity <= 0) {
      console.log('Producto agotado');
      machine.returnMoney();
      machine.setSelectedProduct(null);
      machine.setState(new IdleState());
      return;
    }

    const price = item.price;
    const paid = machine.getCurrentMoney();
    const change = paid - price;

    if (change < 0) {
      console.log('Pago insuficiente (esto no debería pasar)');
      machine.returnMoney();
      machine.setState(new IdleState());
      return;
    }

    // Verificar si podemos dar cambio
    if (change > 0 && !inventory.canMakeChange(change)) {
      console.log('No tenemos cambio exacto. Cancelando transacción.');
      machine.returnMoney();
      machine.setSelectedProduct(null);
      machine.setState(new IdleState());
      return;
    }

    // Procesar venta
    if (!inventory.decreaseStock(code)) {
      console.log('Error al dispensar: producto agotado');
      machine.returnMoney();
      machine.setState(new IdleState());
      return;
    }

    // Guardar el dinero insertado (menos el cambio)
    // Simulamos que aceptamos el pago
    const paidMap = machine.getCurrentMoneyMap();
    for (const [denom, count] of paidMap) {
      inventory.addCash(denom, count);
    }

    // Dar cambio
    if (change > 0) {
      const changeMap = inventory.dispenseChange(change);
      console.log('Cambio entregado:');
      for (const [denom, count] of changeMap) {
        console.log(`  ${count} x $${denom}`);
      }
    }

    console.log(`Producto ${item.name} dispensado. ¡Disfruta!`);

    // Resetear máquina
    machine.clearMoney();
    machine.setSelectedProduct(null);
    machine.setState(new IdleState());
  }
}
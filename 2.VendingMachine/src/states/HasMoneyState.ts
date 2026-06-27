import { State } from './State';
import { VendingMachine } from '../VendingMachine';
import { Denomination } from '../models/Denomination';
import { DispenseState } from './DispenseState';
import { IdleState } from './IdleState';

export class HasMoneyState implements State {
  selectProduct(_code: string, _machine: VendingMachine): void {
    console.log('Ya hay una transacción en curso. Cancela o termina.');
  }

  insertMoney(denom: Denomination, machine: VendingMachine): void {
    machine.addMoney(denom);
    const total = machine.getCurrentMoney();
    const selectedCode = machine.getSelectedProduct();
    if (!selectedCode) {
      console.log('Error: no hay producto seleccionado');
      machine.setState(new IdleState());
      return;
    }
    const item = machine.getInventory().getItem(selectedCode);
    if (!item) {
      console.log('Producto no encontrado');
      machine.setState(new IdleState());
      return;
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
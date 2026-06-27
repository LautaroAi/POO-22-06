import { State } from './State';
import { VendingMachine } from '../VendingMachine';
import { Denomination } from '../models/Denomination';
import { HasMoneyState } from './HasMoneyState';

export class IdleState implements State {
  selectProduct(code: string, machine: VendingMachine): void {
    if (!machine.getInventory().hasStock(code)) {
      console.log('Producto agotado o inexistente');
      return;
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
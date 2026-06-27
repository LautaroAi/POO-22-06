import { VendingMachine } from '../VendingMachine';
import { Denomination } from '../models/Denomination';

export interface State {
  selectProduct(code: string, machine: VendingMachine): void;
  insertMoney(denom: Denomination, machine: VendingMachine): void;
  cancel(machine: VendingMachine): void;
  dispense(machine: VendingMachine): void;
}
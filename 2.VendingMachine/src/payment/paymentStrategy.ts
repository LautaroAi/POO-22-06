import { VendingMachine } from '../VendingMachine';

export interface PaymentStrategy {
  pay(amount: number, machine: VendingMachine): Promise<boolean>;
}
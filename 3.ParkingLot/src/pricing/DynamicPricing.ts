import { PricingStrategy } from './PricingStrategy';
import { Ticket } from '../models/Ticket';

export class DynamicPricing implements PricingStrategy {
  private baseRate: number;
  private demandFactor: number;

  constructor(baseRate: number = 5, demandFactor: number = 1.2) {
    this.baseRate = baseRate;
    this.demandFactor = demandFactor;
  }

  calculatePrice(ticket: Ticket): number {
    if (!ticket.exitTime) {
      throw new Error('Ticket has no exit time');
    }
    const hours = Math.ceil(
      (ticket.exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60)
    );
    const totalHours = Math.max(1, hours);
    return totalHours * this.baseRate * this.demandFactor;
  }
}
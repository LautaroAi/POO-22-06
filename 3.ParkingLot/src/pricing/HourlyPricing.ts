import { PricingStrategy } from './PricingStrategy';
import { Ticket } from '../models/Ticket';

export class HourlyPricing implements PricingStrategy {
  private ratePerHour: number;

  constructor(ratePerHour: number = 5) {
    this.ratePerHour = ratePerHour;
  }

  calculatePrice(ticket: Ticket): number {
    if (!ticket.exitTime) {
      throw new Error('Ticket has no exit time');
    }
    const hours = Math.ceil(
      (ticket.exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60)
    );
    // Cobrar al menos 1 hora
    const totalHours = Math.max(1, hours);
    return totalHours * this.ratePerHour;
  }
}
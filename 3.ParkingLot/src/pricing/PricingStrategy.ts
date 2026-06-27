import { Ticket } from '../models/Ticket';

export interface PricingStrategy {
  calculatePrice(ticket: Ticket): number;
}
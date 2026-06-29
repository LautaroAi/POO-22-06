import { Trip } from '../../models/Trip';

export interface PricingStrategy {
  calculateFare(trip: Trip): number;
}
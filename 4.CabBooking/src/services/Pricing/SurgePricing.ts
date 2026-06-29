import { PricingStrategy } from './PricingStrategy';
import { Trip } from '../../models/Trip';

export class SurgePricing implements PricingStrategy {
  private baseFare: number = 5;
  private perKm: number = 1.5;
  private perMinute: number = 0.5;
  private surgeMultiplier: number;

  constructor(surgeMultiplier: number = 1.5) {
    this.surgeMultiplier = surgeMultiplier;
  }

  calculateFare(trip: Trip): number {
    const distance = trip.pickupLocation.distanceTo(trip.dropoffLocation);
    const duration = trip.getDurationInMinutes();
    const base = this.baseFare + (distance * this.perKm) + (duration * this.perMinute);
    return base * this.surgeMultiplier;
  }
}
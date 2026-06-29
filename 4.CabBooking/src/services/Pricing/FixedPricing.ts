import { PricingStrategy } from './PricingStrategy';
import { Trip } from '../../models/Trip';

export class FixedPricing implements PricingStrategy {
  private baseFare: number = 5;
  private perKm: number = 1.5;
  private perMinute: number = 0.5;

  calculateFare(trip: Trip): number {
    const distance = trip.pickupLocation.distanceTo(trip.dropoffLocation);
    const duration = trip.getDurationInMinutes();
    return this.baseFare + (distance * this.perKm) + (duration * this.perMinute);
  }
}
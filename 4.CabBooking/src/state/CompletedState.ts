import { TripState } from './TripState';
import { Trip } from '../models/Trip';

export class CompletedState extends TripState {
  assignDriver(trip: Trip, driverId: string): void {
    throw new Error('Cannot assign driver to completed trip');
  }

  startTrip(trip: Trip): void {
    throw new Error('Cannot start completed trip');
  }

  completeTrip(trip: Trip): void {
    throw new Error('Trip already completed');
  }

  cancelTrip(trip: Trip): void {
    throw new Error('Cannot cancel completed trip');
  }
}
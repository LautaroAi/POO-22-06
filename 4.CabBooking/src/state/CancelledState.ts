import { TripState } from './TripState';
import { Trip } from '../models/Trip';

export class CancelledState extends TripState {
  assignDriver(trip: Trip, driverId: string): void {
    throw new Error('Cannot assign driver to cancelled trip');
  }

  startTrip(trip: Trip): void {
    throw new Error('Cannot start cancelled trip');
  }

  completeTrip(trip: Trip): void {
    throw new Error('Cannot complete cancelled trip');
  }

  cancelTrip(trip: Trip): void {
    throw new Error('Trip already cancelled');
  }
}
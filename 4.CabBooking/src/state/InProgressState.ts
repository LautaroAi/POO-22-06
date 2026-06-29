import { TripState } from './TripState';
import { Trip } from '../models/Trip';
import { CompletedState } from './CompletedState';
import { CancelledState } from './CancelledState';

export class InProgressState extends TripState {
  assignDriver(trip: Trip, driverId: string): void {
    throw new Error('Cannot assign driver while trip is in progress');
  }

  startTrip(trip: Trip): void {
    throw new Error('Trip already started');
  }

  completeTrip(trip: Trip): void {
    trip.setState(new CompletedState());
  }

  cancelTrip(trip: Trip): void {
    trip.setState(new CancelledState());
  }
}
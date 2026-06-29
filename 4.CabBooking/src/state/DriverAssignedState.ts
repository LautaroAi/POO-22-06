import { TripState } from './TripState';
import { Trip } from '../models/Trip';
import { InProgressState } from './InProgressState';
import { CancelledState } from './CancelledState';

export class DriverAssignedState extends TripState {
  assignDriver(trip: Trip, driverId: string): void {
    throw new Error('Driver already assigned');
  }

  startTrip(trip: Trip): void {
    trip.setState(new InProgressState());
  }

  completeTrip(trip: Trip): void {
    throw new Error('Cannot complete before starting');
  }

  cancelTrip(trip: Trip): void {
    trip.setState(new CancelledState());
  }
}
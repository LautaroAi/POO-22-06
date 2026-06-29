import { TripState } from './TripState';
import { Trip } from '../models/Trip';
import { DriverAssignedState } from './DriverAssignedState';
import { CancelledState } from './CancelledState';

export class RequestedState extends TripState {
  assignDriver(trip: Trip, driverId: string): void {
    // La lógica de asignación la hace MatchingService, pero aquí cambiamos estado
    trip.setState(new DriverAssignedState());
  }

  startTrip(trip: Trip): void {
    throw new Error('Cannot start a trip that has no driver assigned');
  }

  completeTrip(trip: Trip): void {
    throw new Error('Cannot complete a trip that has not started');
  }

  cancelTrip(trip: Trip): void {
    trip.setState(new CancelledState());
  }
}
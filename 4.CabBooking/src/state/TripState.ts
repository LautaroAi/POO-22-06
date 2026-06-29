import { Trip } from '../models/Trip';

export abstract class TripState {
  abstract assignDriver(trip: Trip, driverId: string): void;
  abstract startTrip(trip: Trip): void;
  abstract completeTrip(trip: Trip): void;
  abstract cancelTrip(trip: Trip): void;
}
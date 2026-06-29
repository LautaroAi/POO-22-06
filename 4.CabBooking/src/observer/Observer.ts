import { Trip } from '../models/Trip';

export interface Observer {
  update(trip: Trip): void;
}
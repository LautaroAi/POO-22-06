import { Passenger } from '../models/Passenger';
import { GeoLocation } from '../models/GeoLocation';

export class DemandService {
  private passengers: Map<string, Passenger> = new Map();

  addPassenger(passenger: Passenger): void {
    this.passengers.set(passenger.id, passenger);
  }

  updatePassengerGeoLocation(passengerId: string, GeoLocation: GeoLocation): void {
    const passenger = this.passengers.get(passengerId);
    if (passenger) {
      passenger.updateGeoLocation(GeoLocation);
    }
  }

  getPassenger(id: string): Passenger | undefined {
    return this.passengers.get(id);
  }
}
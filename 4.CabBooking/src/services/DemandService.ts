import { Passenger } from '../models/Passenger';
import { Location } from '../models/Location';

export class DemandService {
  private passengers: Map<string, Passenger> = new Map();

  addPassenger(passenger: Passenger): void {
    this.passengers.set(passenger.id, passenger);
  }

  updatePassengerLocation(passengerId: string, location: Location): void {
    const passenger = this.passengers.get(passengerId);
    if (passenger) {
      passenger.updateLocation(location);
    }
  }

  getPassenger(id: string): Passenger | undefined {
    return this.passengers.get(id);
  }
}
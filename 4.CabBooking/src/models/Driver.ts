import { Location } from './Location';
import { VehicleType } from './VehicleType';

export class Driver {
  public isAvailable: boolean = true;
  public currentLocation: Location;
  public currentTripId: string | null = null;
  public rating: number = 4.5;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly vehicleType: VehicleType,
    location: Location
  ) {
    this.currentLocation = location;
  }

  updateLocation(location: Location): void {
    this.currentLocation = location;
  }

  setAvailable(available: boolean): void {
    this.isAvailable = available;
  }

  assignTrip(tripId: string): void {
    this.currentTripId = tripId;
    this.isAvailable = false;
  }

  completeTrip(): void {
    this.currentTripId = null;
    this.isAvailable = true;
  }
}
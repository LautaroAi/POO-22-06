import { GeoLocation } from './GeoLocation';
import { VehicleType } from './VehicleType';

export class Driver {
  public isAvailable: boolean = true;
  public currentGeoLocation: GeoLocation;
  public currentTripId: string | null = null;
  public rating: number = 4.5;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly vehicleType: VehicleType,
    GeoLocation: GeoLocation
  ) {
    this.currentGeoLocation = GeoLocation;
  }

  updateGeoLocation(GeoLocation: GeoLocation): void {
    this.currentGeoLocation = GeoLocation;
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
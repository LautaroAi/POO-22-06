import { GeoLocation } from './GeoLocation';

export class Passenger {
  public currentGeoLocation: GeoLocation;

  constructor(
    public readonly id: string,
    public readonly name: string,
    GeoLocation: GeoLocation
  ) {
    this.currentGeoLocation = GeoLocation;
  }

  updateGeoLocation(GeoLocation: GeoLocation): void {
    this.currentGeoLocation = GeoLocation;
  }
}
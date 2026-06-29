import { Location } from './Location';

export class Passenger {
  public currentLocation: Location;

  constructor(
    public readonly id: string,
    public readonly name: string,
    location: Location
  ) {
    this.currentLocation = location;
  }

  updateLocation(location: Location): void {
    this.currentLocation = location;
  }
}
import { VehicleSize } from '../enums/VehicleSize';
import { Vehicle } from './Vehicle';

export class ParkingSpot {
  private vehicle: Vehicle | null = null;

  constructor(
    public readonly id: string,
    public readonly size: VehicleSize,
    public readonly level: number,
    public readonly row: number
  ) {}

  isAvailable(): boolean {
    return this.vehicle === null;
  }

  assign(vehicle: Vehicle): void {
    if (!this.isAvailable()) {
      throw new Error(`Spot ${this.id} is already occupied`);
    }
    if (this.size === VehicleSize.LARGE && vehicle.size === VehicleSize.SMALL) {
      // Small vehicle can park in large spot, but it's allowed
    }
    this.vehicle = vehicle;
  }

  free(): void {
    this.vehicle = null;
  }

  getVehicle(): Vehicle | null {
    return this.vehicle;
  }

  canFit(vehicle: Vehicle): boolean {
    // SMALL fits in SMALL, MEDIUM, LARGE
    // MEDIUM fits in MEDIUM, LARGE
    // LARGE fits only in LARGE
    if (vehicle.size === VehicleSize.SMALL) return true;
    if (vehicle.size === VehicleSize.MEDIUM && this.size !== VehicleSize.SMALL) return true;
    if (vehicle.size === VehicleSize.LARGE && this.size === VehicleSize.LARGE) return true;
    return false;
  }
}
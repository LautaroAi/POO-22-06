import { VehicleSize } from '../enums/VehicleSize';

export abstract class Vehicle {
  constructor(
    public readonly licensePlate: string,
    public readonly size: VehicleSize
  ) {}
}
import { Vehicle } from './Vehicle';
import { VehicleSize } from '../enums/VehicleSize';

export class Motorcycle extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleSize.SMALL);
  }
}
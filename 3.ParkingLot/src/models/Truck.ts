import { Vehicle } from './Vehicle';
import { VehicleSize } from '../enums/VehicleSize';

export class Truck extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleSize.LARGE);
  }
}
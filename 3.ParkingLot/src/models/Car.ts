import { Vehicle } from './Vehicle';
import { VehicleSize } from '../enums/VehicleSize';

export class Car extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleSize.MEDIUM);
  }
}
import { ParkingSpot } from '../models/ParkingSpot';
import { VehicleSize } from '../enums/VehicleSize';

export class SpotFactory {
  static createSpots(
    level: number,
    row: number,
    spotsPerRow: number,
    size: VehicleSize,
    prefix: string
  ): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    for (let i = 0; i < spotsPerRow; i++) {
      const id = `${prefix}-L${level}-R${row}-S${i}`;
      spots.push(new ParkingSpot(id, size, level, row));
    }
    return spots;
  }
}
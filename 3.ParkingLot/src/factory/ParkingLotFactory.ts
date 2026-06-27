import { ParkingSpot } from '../models/ParkingSpot';
import { VehicleSize } from '../enums/VehicleSize';
import { SpotFactory } from './SpotFactory';

export interface ParkingLotConfig {
  levels: number;
  rowsPerLevel: number;
  spotsPerRow: {
    small: number;
    medium: number;
    large: number;
  };
}

export class ParkingLotFactory {
  static createParkingLot(config: ParkingLotConfig): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    let spotCounter = 0;

    for (let level = 0; level < config.levels; level++) {
      for (let row = 0; row < config.rowsPerLevel; row++) {
        // Pequeños
        const smallSpots = SpotFactory.createSpots(
          level,
          row,
          config.spotsPerRow.small,
          VehicleSize.SMALL,
          `SM${spotCounter++}`
        );
        spots.push(...smallSpots);

        // Medianos
        const mediumSpots = SpotFactory.createSpots(
          level,
          row,
          config.spotsPerRow.medium,
          VehicleSize.MEDIUM,
          `MD${spotCounter++}`
        );
        spots.push(...mediumSpots);

        // Grandes
        const largeSpots = SpotFactory.createSpots(
          level,
          row,
          config.spotsPerRow.large,
          VehicleSize.LARGE,
          `LG${spotCounter++}`
        );
        spots.push(...largeSpots);
      }
    }
    return spots;
  }
}
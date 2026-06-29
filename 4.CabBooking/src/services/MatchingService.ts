import { Passenger } from '../models/Passenger';
import { Driver } from '../models/Driver';
import { Trip } from '../models/Trip';
import { SupplyService } from './SupplyService';
import { DemandService } from './DemandService';
import { Location } from '../models/Location';

export class MatchingService {
  constructor(
    private supplyService: SupplyService,
    private demandService: DemandService
  ) {}

  findNearestDriver(passengerId: string, radiusKm: number = 5): Driver | null {
    const passenger = this.demandService.getPassenger(passengerId);
    if (!passenger) return null;

    const drivers = this.supplyService.getAvailableDrivers(
      passenger.currentLocation,
      radiusKm
    );

    // Priorizar drivers con mejor rating y más cercanos
    const sorted = drivers.sort((a, b) => {
      const distA = a.currentLocation.distanceTo(passenger.currentLocation);
      const distB = b.currentLocation.distanceTo(passenger.currentLocation);
      if (distA !== distB) return distA - distB;
      return b.rating - a.rating;
    });

    return sorted.length > 0 ? sorted[0] : null;
  }

  matchTrip(trip: Trip, radiusKm: number = 5): Driver | null {
    const driver = this.findNearestDriver(trip.passenger.id, radiusKm);
    if (driver) {
      trip.assignDriver(driver);
      driver.assignTrip(trip.id);
      return driver;
    }
    return null;
  }
}
import { Passenger } from '../models/Passenger';
import { Driver } from '../models/Driver';
import { Trip } from '../models/Trip';
import { GeoLocation } from '../models/GeoLocation';
import { SupplyService } from '../services/SupplyService';
import { DemandService } from '../services/DemandService';
import { MatchingService } from '../services/MatchingService';
import { PricingStrategy } from '../services/pricing/PricingStrategy';
import { FixedPricing } from '../services/pricing/FixedPricing';
import { TripSubject } from '../observer/TripSubject';
import { VehicleType } from '../models/VehicleType';

export class CabBookingFacade {
  private supplyService: SupplyService;
  private demandService: DemandService;
  private matchingService: MatchingService;
  private trips: Map<string, Trip> = new Map();
  private tripSubjects: Map<string, TripSubject> = new Map();
  private tripCounter: number = 0;

  constructor() {
    this.supplyService = new SupplyService();
    this.demandService = new DemandService();
    this.matchingService = new MatchingService(this.supplyService, this.demandService);
  }

  registerPassenger(id: string, name: string, GeoLocation: GeoLocation): Passenger {
    const passenger = new Passenger(id, name, GeoLocation);
    this.demandService.addPassenger(passenger);
    return passenger;
  }

  registerDriver(id: string, name: string, vehicleType: VehicleType, GeoLocation: GeoLocation): Driver {
    const driver = new Driver(id, name, vehicleType, GeoLocation);
    this.supplyService.addDriver(driver);
    return driver;
  }

  updatePassengerGeoLocation(passengerId: string, GeoLocation: GeoLocation): void {
    this.demandService.updatePassengerGeoLocation(passengerId, GeoLocation);
  }

  updateDriverGeoLocation(driverId: string, GeoLocation: GeoLocation): void {
    this.supplyService.updateDriverGeoLocation(driverId, GeoLocation);
  }

  requestTrip(
    passengerId: string,
    pickup: GeoLocation,
    dropoff: GeoLocation,
    pricingStrategy?: PricingStrategy
  ): Trip {
    const passenger = this.demandService.getPassenger(passengerId);
    if (!passenger) {
      throw new Error(`Passenger ${passengerId} not found`);
    }

    const tripId = `TRIP-${++this.tripCounter}`;
    const trip = new Trip(tripId, passenger, pickup, dropoff, pricingStrategy || new FixedPricing());

    // El MatchingService asigna el conductor si encuentra uno
    const driver = this.matchingService.matchTrip(trip, 10);

    // Crear subject y adjuntar observadores
    const subject = new TripSubject();
    subject.attach({
      update: (t: Trip) => {
        console.log(`[${t.passenger.name}] Trip ${t.id} status: ${t.status}`);
      }
    });
    if (driver) {
      subject.attach({
        update: (t: Trip) => {
          console.log(`[${driver.name}] Trip ${t.id} status: ${t.status}`);
        }
      });
    }

    this.trips.set(tripId, trip);
    this.tripSubjects.set(tripId, subject);
    subject.notify(trip);

    return trip;
  }

  startTrip(tripId: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    trip.startTrip();
    this.tripSubjects.get(tripId)?.notify(trip);
  }

  completeTrip(tripId: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    trip.completeTrip();
    if (trip.driver) {
      trip.driver.completeTrip();
    }
    this.tripSubjects.get(tripId)?.notify(trip);
    console.log(`Trip ${tripId} completed. Fare: $${trip.fare.toFixed(2)}`);
  }

  cancelTrip(tripId: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    trip.cancelTrip();
    if (trip.driver) {
      trip.driver.completeTrip();
    }
    this.tripSubjects.get(tripId)?.notify(trip);
  }

  getTrip(tripId: string): Trip | undefined {
    return this.trips.get(tripId);
  }

  getNearbyDrivers(GeoLocation: GeoLocation, radiusKm: number = 5): Driver[] {
    return this.supplyService.getAvailableDrivers(GeoLocation, radiusKm);
  }
}
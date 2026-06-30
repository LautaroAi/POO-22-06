// Cab Booking con Observer, State, Strategy y grid geoespacial

// modelos y enums
enum TripStatus { REQUESTED, DRIVER_ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED }
enum VehicleType { SEDAN, SUV, HATCHBACK, AUTO }

class GeoLocation {
  public lat: number; public lng: number;
  constructor(lat: number, lng: number) { this.lat = lat; this.lng = lng; }
  distanceTo(other: GeoLocation): number {
    const latDiff = this.lat - other.lat;
    const lngDiff = this.lng - other.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
  }
  getGridKey(gridSize: number = 0.1): string {
    const latGrid = Math.floor(this.lat / gridSize);
    const lngGrid = Math.floor(this.lng / gridSize);
    return `${latGrid},${lngGrid}`;
  }
}
 // modelos básicos
class Passenger {
  public id: string; public name: string; public currentGeoLocation: GeoLocation;
  constructor(id: string, name: string, GeoLocation: GeoLocation) {
    this.id = id; this.name = name; this.currentGeoLocation = GeoLocation;
  }
  updateGeoLocation(GeoLocation: GeoLocation): void { this.currentGeoLocation = GeoLocation; }
}

class Driver {
  public id: string; public name: string; public vehicleType: VehicleType;
  public currentGeoLocation: GeoLocation; public isAvailable: boolean = true;
  public currentTripId: string | null = null; public rating: number = 4.5;
  constructor(id: string, name: string, vehicleType: VehicleType, GeoLocation: GeoLocation) {
    this.id = id; this.name = name; this.vehicleType = vehicleType; this.currentGeoLocation = GeoLocation;
  }
  updateGeoLocation(GeoLocation: GeoLocation): void { this.currentGeoLocation = GeoLocation; }
  setAvailable(available: boolean): void { this.isAvailable = available; }
  assignTrip(tripId: string): void { this.currentTripId = tripId; this.isAvailable = false; }
  completeTrip(): void { this.currentTripId = null; this.isAvailable = true; }
}

// Pricing Strategy
interface PricingStrategy {
  calculateFare(trip: any): number;
}
class FixedPricing implements PricingStrategy {
  private baseFare: number = 5; private perKm: number = 1.5; private perMinute: number = 0.5;
  calculateFare(trip: any): number {
    const distance = trip.pickupGeoLocation.distanceTo(trip.dropoffGeoLocation);
    const duration = trip.getDurationInMinutes();
    return this.baseFare + distance * this.perKm + duration * this.perMinute;
  }
}
class SurgePricing implements PricingStrategy {
  private baseFare: number = 5; private perKm: number = 1.5; private perMinute: number = 0.5;
  private surgeMultiplier: number;
  constructor(surgeMultiplier: number = 1.5) { this.surgeMultiplier = surgeMultiplier; }
  calculateFare(trip: any): number {
    const distance = trip.pickupGeoLocation.distanceTo(trip.dropoffGeoLocation);
    const duration = trip.getDurationInMinutes();
    const base = this.baseFare + distance * this.perKm + duration * this.perMinute;
    return base * this.surgeMultiplier;
  }
}

// estados de viaje
interface TripState {
  assignDriver(trip: any, driverId: string): void;
  startTrip(trip: any): void;
  completeTrip(trip: any): void;
  cancelTrip(trip: any): void;
}
class RequestedState implements TripState {
  assignDriver(trip: any, _driverId: string): void { trip.setState(new DriverAssignedState()); }
  startTrip(_trip: any): void { throw new Error('Cannot start without driver'); }
  completeTrip(_trip: any): void { throw new Error('Cannot complete before start'); }
  cancelTrip(trip: any): void { trip.setState(new CancelledState()); }
}
class DriverAssignedState implements TripState {
  assignDriver(_trip: any, _driverId: string): void { throw new Error('Driver already assigned'); }
  startTrip(trip: any): void { trip.setState(new InProgressState()); }
  completeTrip(_trip: any): void { throw new Error('Cannot complete before start'); }
  cancelTrip(trip: any): void { trip.setState(new CancelledState()); }
}
class InProgressState implements TripState {
  assignDriver(_trip: any, _driverId: string): void { throw new Error('Cannot assign during trip'); }
  startTrip(_trip: any): void { throw new Error('Already started'); }
  completeTrip(trip: any): void { trip.setState(new CompletedState()); }
  cancelTrip(trip: any): void { trip.setState(new CancelledState()); }
}
class CompletedState implements TripState {
  assignDriver(_trip: any, _driverId: string): void { throw new Error('Cannot assign to completed'); }
  startTrip(_trip: any): void { throw new Error('Cannot start completed'); }
  completeTrip(_trip: any): void { throw new Error('Already completed'); }
  cancelTrip(_trip: any): void { throw new Error('Cannot cancel completed'); }
}
class CancelledState implements TripState {
  assignDriver(_trip: any, _driverId: string): void { throw new Error('Cannot assign to cancelled'); }
  startTrip(_trip: any): void { throw new Error('Cannot start cancelled'); }
  completeTrip(_trip: any): void { throw new Error('Cannot complete cancelled'); }
  cancelTrip(_trip: any): void { throw new Error('Already cancelled'); }
}

// Trip (entidad principal)
class Trip {
  public id: string; public passenger: Passenger; public pickupGeoLocation: GeoLocation;
  public dropoffGeoLocation: GeoLocation; public driver: Driver | null = null;
  public status: TripStatus = TripStatus.REQUESTED;
  public startTime: Date; public endTime: Date | null = null;
  public fare: number = 0;
  private state: TripState;
  private pricingStrategy: PricingStrategy;
  constructor(id: string, passenger: Passenger, pickup: GeoLocation, dropoff: GeoLocation, pricingStrategy?: PricingStrategy) {
    this.id = id; this.passenger = passenger; this.pickupGeoLocation = pickup; this.dropoffGeoLocation = dropoff;
    this.startTime = new Date();
    this.pricingStrategy = pricingStrategy || new FixedPricing();
    this.state = new RequestedState();
  }
  setState(state: TripState): void { this.state = state; }
  assignDriver(driver: Driver): void {
    this.state.assignDriver(this, driver.id);
    this.driver = driver; this.status = TripStatus.DRIVER_ASSIGNED;
  }
  startTrip(): void {
    this.state.startTrip(this);
    this.status = TripStatus.IN_PROGRESS;
    this.startTime = new Date();
  }
  completeTrip(): void {
    this.state.completeTrip(this);
    this.status = TripStatus.COMPLETED;
    this.endTime = new Date();
    this.fare = this.pricingStrategy.calculateFare(this);
  }
  cancelTrip(): void {
    this.state.cancelTrip(this);
    this.status = TripStatus.CANCELLED;
    this.endTime = new Date();
  }
  getDurationInMinutes(): number {
    const end = this.endTime || new Date();
    return (end.getTime() - this.startTime.getTime()) / (1000 * 60);
  }
}

// Observer
interface Observer {
  update(trip: Trip): void;
}
class TripSubject {
  private observers: Observer[] = [];
  attach(observer: Observer): void { this.observers.push(observer); }
  detach(observer: Observer): void { const i = this.observers.indexOf(observer); if (i !== -1) this.observers.splice(i, 1); }
  notify(trip: Trip): void { for (const o of this.observers) o.update(trip); }
}

// Servicios (Supply, Demand, Matching)
class SupplyService {
  private drivers: Map<string, Driver> = new Map();
  private gridIndex: Map<string, Set<string>> = new Map();
  private gridSize: number = 0.1;
  addDriver(driver: Driver): void { this.drivers.set(driver.id, driver); this.indexDriver(driver); }
  private indexDriver(driver: Driver): void {
    const key = driver.currentGeoLocation.getGridKey(this.gridSize);
    if (!this.gridIndex.has(key)) this.gridIndex.set(key, new Set());
    this.gridIndex.get(key)!.add(driver.id);
  }
  updateDriverGeoLocation(driverId: string, GeoLocation: GeoLocation): void {
    const driver = this.drivers.get(driverId);
    if (!driver) return;
    const oldKey = driver.currentGeoLocation.getGridKey(this.gridSize);
    this.gridIndex.get(oldKey)?.delete(driverId);
    driver.updateGeoLocation(GeoLocation);
    this.indexDriver(driver);
  }
  getAvailableDrivers(GeoLocation: GeoLocation, radiusKm: number = 5): Driver[] {
    const gridRadius = Math.ceil(radiusKm / (this.gridSize * 111));
    const centerKey = GeoLocation.getGridKey(this.gridSize);
    const [centerLat, centerLng] = centerKey.split(',').map(Number);
    const result: Driver[] = [];
    for (let dl = -gridRadius; dl <= gridRadius; dl++) {
      for (let dlg = -gridRadius; dlg <= gridRadius; dlg++) {
        const key = `${centerLat + dl},${centerLng + dlg}`;
        const ids = this.gridIndex.get(key);
        if (ids) {
          for (const id of ids) {
            const d = this.drivers.get(id);
            if (d && d.isAvailable && d.currentGeoLocation.distanceTo(GeoLocation) <= radiusKm) {
              result.push(d);
            }
          }
        }
      }
    }
    return result.sort((a, b) => a.currentGeoLocation.distanceTo(GeoLocation) - b.currentGeoLocation.distanceTo(GeoLocation));
  }
  getDriver(id: string): Driver | undefined { return this.drivers.get(id); }
}

class DemandService {
  private passengers: Map<string, Passenger> = new Map();
  addPassenger(p: Passenger): void { this.passengers.set(p.id, p); }
  updatePassengerGeoLocation(id: string, loc: GeoLocation): void {
    const p = this.passengers.get(id);
    if (p) p.updateGeoLocation(loc);
  }
  getPassenger(id: string): Passenger | undefined { return this.passengers.get(id); }
}

class MatchingService {
  private supply: SupplyService; private demand: DemandService;
  constructor(supply: SupplyService, demand: DemandService) {
    this.supply = supply; this.demand = demand;
  }
  findNearestDriver(passengerId: string, radiusKm: number = 5): Driver | null {
    const passenger = this.demand.getPassenger(passengerId);
    if (!passenger) return null;
    const drivers = this.supply.getAvailableDrivers(passenger.currentGeoLocation, radiusKm);
    return drivers.length > 0 ? drivers[0] : null;
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

// Facade
class CabBookingFacade {
  private supply: SupplyService; private demand: DemandService;
  private matching: MatchingService;
  private trips: Map<string, Trip> = new Map();
  private tripSubjects: Map<string, TripSubject> = new Map();
  private tripCounter: number = 0;

  constructor() {
    this.supply = new SupplyService();
    this.demand = new DemandService();
    this.matching = new MatchingService(this.supply, this.demand);
  }
  registerPassenger(id: string, name: string, loc: GeoLocation): Passenger {
    const p = new Passenger(id, name, loc);
    this.demand.addPassenger(p);
    return p;
  }
  registerDriver(id: string, name: string, vehicleType: VehicleType, loc: GeoLocation): Driver {
    const d = new Driver(id, name, vehicleType, loc);
    this.supply.addDriver(d);
    return d;
  }
  updatePassengerGeoLocation(id: string, loc: GeoLocation): void { this.demand.updatePassengerGeoLocation(id, loc); }
  updateDriverGeoLocation(id: string, loc: GeoLocation): void { this.supply.updateDriverGeoLocation(id, loc); }

  requestTrip(passengerId: string, pickup: GeoLocation, dropoff: GeoLocation, pricingStrategy?: PricingStrategy): Trip {
    const passenger = this.demand.getPassenger(passengerId);
    if (!passenger) throw new Error(`Passenger ${passengerId} not found`);
    const tripId = `TRIP-${++this.tripCounter}`;
    const trip = new Trip(tripId, passenger, pickup, dropoff, pricingStrategy || new FixedPricing());
    const driver = this.matching.matchTrip(trip, 10);
    const subject = new TripSubject();
    subject.attach({ update: (t: Trip) => console.log(`[${t.passenger.name}] Trip ${t.id} status: ${t.status}`) });
    if (driver) {
      subject.attach({ update: (t: Trip) => console.log(`[${driver.name}] Trip ${t.id} status: ${t.status}`) });
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
    if (trip.driver) trip.driver.completeTrip();
    this.tripSubjects.get(tripId)?.notify(trip);
    console.log(`Trip ${tripId} completed. Fare: $${trip.fare.toFixed(2)}`);
  }
  cancelTrip(tripId: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    trip.cancelTrip();
    if (trip.driver) trip.driver.completeTrip();
    this.tripSubjects.get(tripId)?.notify(trip);
  }
  getTrip(tripId: string): Trip | undefined { return this.trips.get(tripId); }
  getNearbyDrivers(loc: GeoLocation, radiusKm: number = 5): Driver[] {
    return this.supply.getAvailableDrivers(loc, radiusKm);
  }
}

// ejemplo de uso (simulación de viaje con interacciones)
const app = new CabBookingFacade();
const d1 = app.registerDriver('D1', 'Carlos', VehicleType.SEDAN, new GeoLocation(-33.45, -70.65));
const d2 = app.registerDriver('D2', 'María', VehicleType.SUV, new GeoLocation(-33.46, -70.66));
const d3 = app.registerDriver('D3', 'Juan', VehicleType.HATCHBACK, new GeoLocation(-33.44, -70.64));
const ana = app.registerPassenger('P1', 'Ana', new GeoLocation(-33.45, -70.65));

console.log('--- CONDUCTORES DISPONIBLES ---');
const nearby = app.getNearbyDrivers(ana.currentGeoLocation, 2);
console.log(nearby.map(d => `${d.name} (${d.vehicleType})`));

console.log('\n--- ANA SOLICITA VIAJE ---');
const trip = app.requestTrip('P1', new GeoLocation(-33.45, -70.65), new GeoLocation(-33.50, -70.70), new SurgePricing(1.2));
console.log(`Trip ${trip.id} creado, conductor: ${trip.driver?.name}`);

console.log('\n--- INICIANDO VIAJE ---');
app.startTrip(trip.id);

setTimeout(() => {
  console.log('\n--- COMPLETANDO VIAJE ---');
  app.completeTrip(trip.id);
}, 2000);
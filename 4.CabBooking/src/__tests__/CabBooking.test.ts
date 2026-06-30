import { CabBookingFacade } from '../facade/CabBookingFacade';
import { GeoLocation } from '../models/GeoLocation';
import { VehicleType } from '../models/VehicleType';
import { TripStatus } from '../enums/TripStatus';
import { FixedPricing } from '../services/pricing/FixedPricing';

describe('CabBookingSystem', () => {
  let app: CabBookingFacade;

  beforeEach(() => {
    app = new CabBookingFacade();
    // Registrar conductores para pruebas
    app.registerDriver('D1', 'Driver1', VehicleType.SEDAN, new GeoLocation(0, 0));
    app.registerDriver('D2', 'Driver2', VehicleType.PICKUP, new GeoLocation(0.1, 0.1));
    app.registerDriver('D3', 'Driver3', VehicleType.CUPE, new GeoLocation(0.5, 0.5));
  });

  it('should register passenger and drivers', () => {
    const passenger = app.registerPassenger('P1', 'Ana', new GeoLocation(0, 0));
    expect(passenger.id).toBe('P1');
    const drivers = app.getNearbyDrivers(new GeoLocation(0, 0), 5);
    expect(drivers.length).toBeGreaterThan(0);
  });

  it('should match a trip with nearest driver', () => {
    const passenger = app.registerPassenger('P1', 'Ana', new GeoLocation(0, 0));
    const trip = app.requestTrip('P1', new GeoLocation(0, 0), new GeoLocation(0.2, 0.2));
    expect(trip.driver).toBeDefined();
    expect(trip.status).toBe(TripStatus.DRIVER_ASSIGNED);
    // El conductor más cercano debería ser D1 (en 0,0)
    expect(trip.driver?.id).toBe('D1');
  });

  it('should complete a trip successfully', () => {
    const passenger = app.registerPassenger('P1', 'Ana', new GeoLocation(0, 0));
    const trip = app.requestTrip('P1', new GeoLocation(0, 0), new GeoLocation(0.2, 0.2));

    app.startTrip(trip.id);
    expect(trip.status).toBe(TripStatus.IN_PROGRESS);

    app.completeTrip(trip.id);
    expect(trip.status).toBe(TripStatus.COMPLETED);
    expect(trip.fare).toBeGreaterThan(0);
  });

  it('should cancel a trip before start', () => {
    const passenger = app.registerPassenger('P1', 'Ana', new GeoLocation(0, 0));
    const trip = app.requestTrip('P1', new GeoLocation(0, 0), new GeoLocation(0.2, 0.2));

    app.cancelTrip(trip.id);
    expect(trip.status).toBe(TripStatus.CANCELLED);
    expect(trip.driver?.isAvailable).toBe(true);
  });

  it('should not allow invalid state transitions', () => {
    const passenger = app.registerPassenger('P1', 'Ana', new GeoLocation(0, 0));
    const trip = app.requestTrip('P1', new GeoLocation(0, 0), new GeoLocation(0.2, 0.2));

    // Intentar completar sin iniciar
    expect(() => app.completeTrip(trip.id)).toThrow();
  });
});
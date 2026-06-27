import { ParkingLotFacade } from '../facade/ParkingLotFacade';
import { ParkingManager } from '../manager/ParkingManager';
import { ParkingLotFactory } from '../factory/ParkingLotFactory';
import { HourlyPricing } from '../pricing/HourlyPricing';
import { Car } from '../models/Car';
import { Motorcycle } from '../models/Motorcycle';
import { Truck } from '../models/Truck';

describe('ParkingLot', () => {
  let parkingLot: ParkingLotFacade;
  let manager: ParkingManager;

  beforeEach(() => {
    const config = {
      levels: 1,
      rowsPerLevel: 1,
      spotsPerRow: {
        small: 2,
        medium: 2,
        large: 1
      }
    };
    const spots = ParkingLotFactory.createParkingLot(config);
    manager = new ParkingManager();
    spots.forEach(spot => manager.addSpot(spot));
    parkingLot = new ParkingLotFacade(manager, new HourlyPricing(5));
  });

  it('should allow a car to enter and exit', async () => {
    const car = new Car('CAR-001');
    const ticket = parkingLot.enter(car);
    expect(ticket).toBeDefined();

    // Simular que pasa el tiempo: forzamos la hora de salida a 1 hora después
    // Así evitamos setTimeout y la prueba es determinista
    const oneHourLater = new Date(ticket.entryTime.getTime() + 60 * 60 * 1000);
    ticket.exitTime = oneHourLater; // override para prueba

    const amount = await parkingLot.exit(ticket.id);
    expect(amount).toBe(5); // 1 hora * $5
  });

  it('should reject if no spot available', () => {
    // Llenar todos los spots grandes (en este config solo hay 1 grande)
    const truck1 = new Truck('TRK-001');
    const ticket1 = parkingLot.enter(truck1);
    expect(ticket1).toBeDefined();

    // Segundo camión debería fallar porque no hay spot grande libre
    const truck2 = new Truck('TRK-002');
    expect(() => parkingLot.enter(truck2)).toThrow('No available spot');
  });

  it('should assign a small vehicle to a medium spot if small spots are full', () => {
    // Ocupar los 2 spots pequeños con motos
    const bike1 = new Motorcycle('BIKE-1');
    const bike2 = new Motorcycle('BIKE-2');
    parkingLot.enter(bike1);
    parkingLot.enter(bike2);

    // Tercera moto debería ir a un spot mediano (prioriza pequeño, pero no hay)
    const bike3 = new Motorcycle('BIKE-3');
    const ticket = parkingLot.enter(bike3);
    const spot = manager.getSpotByVehicle('BIKE-3');
    expect(spot?.size).toBe('MEDIUM');
  });
});
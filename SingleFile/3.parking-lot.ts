// 3.parking-lot.ts – Parking Lot con Facade, Strategy, Abstract Factory

// enums
enum VehicleSize { SMALL = 'SMALL', MEDIUM = 'MEDIUM', LARGE = 'LARGE' }

// modelos
abstract class Vehicle {
  public licensePlate: string;
  public size: VehicleSize;
  constructor(licensePlate: string, size: VehicleSize) {
    this.licensePlate = licensePlate;
    this.size = size;
  }
}
class Car extends Vehicle { constructor(plate: string) { super(plate, VehicleSize.MEDIUM); } }
class Motorcycle extends Vehicle { constructor(plate: string) { super(plate, VehicleSize.SMALL); } }
class Truck extends Vehicle { constructor(plate: string) { super(plate, VehicleSize.LARGE); } }

class ParkingSpot {
  public id: string; public size: VehicleSize; public level: number; public row: number;
  private vehicle: Vehicle | null = null;
  constructor(id: string, size: VehicleSize, level: number, row: number) {
    this.id = id; this.size = size; this.level = level; this.row = row;
  }
  isAvailable(): boolean { return this.vehicle === null; }
  assign(vehicle: Vehicle): void {
    if (!this.isAvailable()) throw new Error(`Spot ${this.id} already occupied`);
    this.vehicle = vehicle;
  }
  free(): void { this.vehicle = null; }
  getVehicle(): Vehicle | null { return this.vehicle; }
  canFit(vehicle: Vehicle): boolean {
    if (vehicle.size === VehicleSize.SMALL) return true;
    if (vehicle.size === VehicleSize.MEDIUM && this.size !== VehicleSize.SMALL) return true;
    if (vehicle.size === VehicleSize.LARGE && this.size === VehicleSize.LARGE) return true;
    return false;
  }
}

class Ticket {
  public id: string; public spotId: string; public licensePlate: string;
  public entryTime: Date; public exitTime: Date | null = null; public paid: boolean = false;
  constructor(id: string, spotId: string, licensePlate: string, entryTime: Date) {
    this.id = id; this.spotId = spotId; this.licensePlate = licensePlate; this.entryTime = entryTime;
  }
  markExit(): void { this.exitTime = new Date(); }
  markPaid(): void { this.paid = true; }
}

// ParkingManager (búsqueda O(1))
class ParkingManager {
  private spots: Map<string, ParkingSpot> = new Map();
  private availableSpots: Map<VehicleSize, Set<string>> = new Map();
  private vehicleToSpot: Map<string, string> = new Map();

  constructor() {
    for (const size of Object.values(VehicleSize)) {
      this.availableSpots.set(size, new Set());
    }
  }
  addSpot(spot: ParkingSpot): void {
    this.spots.set(spot.id, spot);
    if (spot.isAvailable()) this.availableSpots.get(spot.size)?.add(spot.id);
  }
  findSpot(vehicle: Vehicle): ParkingSpot | null {
    const sizes = this.getCompatibleSizes(vehicle.size);
    for (const size of sizes) {
      const availableSet = this.availableSpots.get(size);
      if (availableSet && availableSet.size > 0) {
        const spotId = availableSet.values().next().value as string;
        return this.spots.get(spotId) || null;
      }
    }
    return null;
  }
  assignSpot(vehicle: Vehicle): ParkingSpot | null {
    const spot = this.findSpot(vehicle);
    if (!spot) return null;
    spot.assign(vehicle);
    this.availableSpots.get(spot.size)?.delete(spot.id);
    this.vehicleToSpot.set(vehicle.licensePlate, spot.id);
    return spot;
  }
  releaseSpot(licensePlate: string): void {
    const spotId = this.vehicleToSpot.get(licensePlate);
    if (!spotId) throw new Error(`Vehicle ${licensePlate} not found`);
    const spot = this.spots.get(spotId);
    if (!spot) throw new Error(`Spot ${spotId} not found`);
    spot.free();
    this.vehicleToSpot.delete(licensePlate);
    this.availableSpots.get(spot.size)?.add(spot.id);
  }
  getSpotByVehicle(licensePlate: string): ParkingSpot | null {
    const spotId = this.vehicleToSpot.get(licensePlate);
    return spotId ? this.spots.get(spotId) || null : null;
  }
  getAvailableCount(): Map<VehicleSize, number> {
    const count = new Map<VehicleSize, number>();
    for (const size of Object.values(VehicleSize)) {
      const set = this.availableSpots.get(size);
      count.set(size, set ? set.size : 0);
    }
    return count;
  }
  private getCompatibleSizes(vehicleSize: VehicleSize): VehicleSize[] {
    switch (vehicleSize) {
      case VehicleSize.SMALL: return [VehicleSize.SMALL, VehicleSize.MEDIUM, VehicleSize.LARGE];
      case VehicleSize.MEDIUM: return [VehicleSize.MEDIUM, VehicleSize.LARGE];
      case VehicleSize.LARGE: return [VehicleSize.LARGE];
      default: return [];
    }
  }
}

// Pricing Strategy
interface PricingStrategy {
  calculatePrice(ticket: Ticket): number;
}
class HourlyPricing implements PricingStrategy {
  private ratePerHour: number;
  constructor(ratePerHour: number = 5) { this.ratePerHour = ratePerHour; }
  calculatePrice(ticket: Ticket): number {
    if (!ticket.exitTime) throw new Error('Ticket has no exit time');
    const hours = Math.ceil((ticket.exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60));
    const totalHours = Math.max(1, hours);
    return totalHours * this.ratePerHour;
  }
}

// Abstract Factory para crear spots
class SpotFactory {
  static createSpots(level: number, row: number, spotsPerRow: number, size: VehicleSize, prefix: string): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    for (let i = 0; i < spotsPerRow; i++) {
      const id = `${prefix}-L${level}-R${row}-S${i}`;
      spots.push(new ParkingSpot(id, size, level, row));
    }
    return spots;
  }
}
interface ParkingLotConfig {
  levels: number; rowsPerLevel: number;
  spotsPerRow: { small: number; medium: number; large: number; };
}
class ParkingLotFactory {
  static createParkingLot(config: ParkingLotConfig): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    let counter = 0;
    for (let l = 0; l < config.levels; l++) {
      for (let r = 0; r < config.rowsPerLevel; r++) {
        spots.push(...SpotFactory.createSpots(l, r, config.spotsPerRow.small, VehicleSize.SMALL, `SM${counter++}`));
        spots.push(...SpotFactory.createSpots(l, r, config.spotsPerRow.medium, VehicleSize.MEDIUM, `MD${counter++}`));
        spots.push(...SpotFactory.createSpots(l, r, config.spotsPerRow.large, VehicleSize.LARGE, `LG${counter++}`));
      }
    }
    return spots;
  }
}

// PaymentProcessor (simulado)
class PaymentProcessor {
  static async processPayment(amount: number, method: string = 'card'): Promise<boolean> {
    console.log(`Procesando pago de $${amount.toFixed(2)} con ${method}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
}

// Facade principal
class ParkingLotFacade {
  private manager: ParkingManager;
  private pricingStrategy: PricingStrategy;
  private tickets: Map<string, Ticket> = new Map();
  private nextTicketId: number = 0;

  constructor(manager: ParkingManager, pricingStrategy?: PricingStrategy) {
    this.manager = manager;
    this.pricingStrategy = pricingStrategy || new HourlyPricing();
  }
  enter(vehicle: Vehicle): Ticket {
    const spot = this.manager.assignSpot(vehicle);
    if (!spot) throw new Error(`No available spot for ${vehicle.licensePlate}`);
    const ticketId = `T${this.nextTicketId++}`;
    const ticket = new Ticket(ticketId, spot.id, vehicle.licensePlate, new Date());
    this.tickets.set(ticketId, ticket);
    console.log(`Vehicle ${vehicle.licensePlate} entered. Spot: ${spot.id}`);
    return ticket;
  }
  async exit(ticketId: string, paymentMethod: string = 'card'): Promise<number> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    if (ticket.paid) throw new Error(`Ticket ${ticketId} already paid`);
    ticket.markExit();
    const amount = this.pricingStrategy.calculatePrice(ticket);
    const success = await PaymentProcessor.processPayment(amount, paymentMethod);
    if (!success) throw new Error('Payment failed');
    ticket.markPaid();
    this.manager.releaseSpot(ticket.licensePlate);
    console.log(`Vehicle ${ticket.licensePlate} exited. Paid: $${amount.toFixed(2)}`);
    return amount;
  }
  getStatus(): string {
    const counts = this.manager.getAvailableCount();
    return `Available: Small=${counts.get(VehicleSize.SMALL)}, Medium=${counts.get(VehicleSize.MEDIUM)}, Large=${counts.get(VehicleSize.LARGE)}`;
  }
  getTicket(ticketId: string): Ticket | undefined {
    return this.tickets.get(ticketId);
  }
}

// ejemplo de uso
const config = { levels: 2, rowsPerLevel: 3, spotsPerRow: { small: 2, medium: 2, large: 1 } };
const spots = ParkingLotFactory.createParkingLot(config);
const manager = new ParkingManager();
spots.forEach(spot => manager.addSpot(spot));
const parkingLot = new ParkingLotFacade(manager, new HourlyPricing(5));

console.log('--- ESTACIONAMIENTO CREADO ---');
console.log(parkingLot.getStatus());

const car = new Car('ABC-123');
const bike = new Motorcycle('XYZ-789');
const truck = new Truck('TRK-001');

const t1 = parkingLot.enter(car);
const t2 = parkingLot.enter(bike);
const t3 = parkingLot.enter(truck);
console.log(parkingLot.getStatus());

// Simular salida después de 1 segundo
setTimeout(async () => {
  try {
    await parkingLot.exit(t1.id);
    console.log(parkingLot.getStatus());
  } catch (err) { console.error(err); }
}, 1000);
setTimeout(async () => {
  try {
    await parkingLot.exit(t2.id);
    console.log(parkingLot.getStatus());
  } catch (err) { console.error(err); }
}, 2000);
setTimeout(async () => {
  try {
    await parkingLot.exit(t3.id);
    console.log(parkingLot.getStatus());
  } catch (err) { console.error(err); }
}, 3000);
import { Vehicle } from '../models/Vehicle';
import { Ticket } from '../models/Ticket';
import { ParkingManager } from '../manager/ParkingManager';
import { PricingStrategy } from '../pricing/PricingStrategy';
import { HourlyPricing } from '../pricing/HourlyPricing';
import { PaymentProcessor } from '../payment/PaymentProcessor';
import { VehicleSize } from '../enums/VehicleSize';

export class ParkingLotFacade {
  private manager: ParkingManager;
  private pricingStrategy: PricingStrategy;
  private tickets: Map<string, Ticket> = new Map(); // ticketId -> Ticket
  private nextTicketId: number = 0;

  constructor(manager: ParkingManager, pricingStrategy?: PricingStrategy) {
    this.manager = manager;
    this.pricingStrategy = pricingStrategy || new HourlyPricing();
  }

  // Entrada: asigna spot y genera ticket
  enter(vehicle: Vehicle): Ticket {
    const spot = this.manager.assignSpot(vehicle);
    if (!spot) {
      throw new Error(`No available spot for vehicle ${vehicle.licensePlate}`);
    }
    const ticketId = `T${this.nextTicketId++}`;
    const ticket = new Ticket(
      ticketId,
      spot.id,
      vehicle.licensePlate,
      new Date()
    );
    this.tickets.set(ticketId, ticket);
    console.log(`Vehicle ${vehicle.licensePlate} entered. Spot: ${spot.id}`);
    return ticket;
  }

  // Salida: calcula precio, procesa pago, libera spot
  async exit(ticketId: string, paymentMethod: string = 'card'): Promise<number> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    if (ticket.paid) {
      throw new Error(`Ticket ${ticketId} already paid`);
    }

    ticket.markExit();
    const amount = this.pricingStrategy.calculatePrice(ticket);

    // Procesar pago
    const success = await PaymentProcessor.processPayment(amount, paymentMethod);
    if (!success) {
      throw new Error('Payment failed');
    }

    ticket.markPaid();
    this.manager.releaseSpot(ticket.licensePlate);
    console.log(`Vehicle ${ticket.licensePlate} exited. Paid: $${amount.toFixed(2)}`);
    return amount;
  }

  // Obtener estado actual
  getStatus(): string {
    const counts = this.manager.getAvailableCount();
    return `Available spots: Small=${counts.get(VehicleSize.SMALL)}, Medium=${counts.get(VehicleSize.MEDIUM)}, Large=${counts.get(VehicleSize.LARGE)}`;
  }

  // Método de consulta para pruebas
  getTicket(ticketId: string): Ticket | undefined {
    return this.tickets.get(ticketId);
  }
}
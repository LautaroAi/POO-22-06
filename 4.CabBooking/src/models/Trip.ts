import { Passenger } from './Passenger';
import { Driver } from './Driver';
import { Location } from './Location';
import { TripStatus } from '../enums/TripStatus';
import { PricingStrategy } from '../services/pricing/PricingStrategy';
import { FixedPricing } from '../services/pricing/FixedPricing';
import { TripState } from '../state/TripState';
import { RequestedState } from '../state/RequestedState';

export class Trip {
  public status: TripStatus = TripStatus.REQUESTED;
  public driver: Driver | null = null;
  public startTime: Date;
  public endTime: Date | null = null;
  public fare: number = 0;
  private state: TripState;
  private pricingStrategy: PricingStrategy;

  constructor(
    public readonly id: string,
    public readonly passenger: Passenger,
    public readonly pickupLocation: Location,
    public readonly dropoffLocation: Location,
    pricingStrategy?: PricingStrategy
  ) {
    this.startTime = new Date();
    this.pricingStrategy = pricingStrategy || new FixedPricing();
    this.state = new RequestedState(); // estado inicial
  }

  // Método para cambiar el estado (solo lo usan los estados)
  setState(state: TripState): void {
    this.state = state;
  }

  // Métodos de negocio que delegan en el estado actual
  assignDriver(driver: Driver): void {
    this.state.assignDriver(this, driver.id);
    this.driver = driver;
    this.status = TripStatus.DRIVER_ASSIGNED;
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

  // Método auxiliar para calcular duración
  getDurationInMinutes(): number {
    const end = this.endTime || new Date();
    return (end.getTime() - this.startTime.getTime()) / (1000 * 60);
  }
}
import { VehicleSize } from '../enums/VehicleSize';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly spotId: string,
    public readonly licensePlate: string,
    public readonly entryTime: Date,
    public exitTime: Date | null = null,
    public paid: boolean = false
  ) {}

  markExit(): void {
    this.exitTime = new Date();
  }

  markPaid(): void {
    this.paid = true;
  }
}
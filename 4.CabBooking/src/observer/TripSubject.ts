import { Observer } from './Observer';
import { Trip } from '../models/Trip';

export class TripSubject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(trip: Trip): void {
    for (const observer of this.observers) {
      observer.update(trip);
    }
  }
}
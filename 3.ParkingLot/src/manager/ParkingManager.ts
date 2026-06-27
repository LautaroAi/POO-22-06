import { ParkingSpot } from '../models/ParkingSpot';
import { Vehicle } from '../models/Vehicle';
import { VehicleSize } from '../enums/VehicleSize';

export class ParkingManager {
  private spots: Map<string, ParkingSpot> = new Map();
  // Índices de spots libres por tamaño (para O(1))
  private availableSpots: Map<VehicleSize, Set<string>> = new Map();
  // Mapa de vehículo -> spotId actual
  private vehicleToSpot: Map<string, string> = new Map();

  constructor() {
    // Inicializar conjuntos vacíos para cada tamaño
    for (const size of Object.values(VehicleSize)) {
      this.availableSpots.set(size, new Set());
    }
  }

  addSpot(spot: ParkingSpot): void {
    this.spots.set(spot.id, spot);
    if (spot.isAvailable()) {
      this.availableSpots.get(spot.size)?.add(spot.id);
    }
  }

  findSpot(vehicle: Vehicle): ParkingSpot | null {
    // Buscar un spot que quepa y esté disponible, priorizando el tamaño exacto
    const sizes = this.getCompatibleSizes(vehicle.size);
    for (const size of sizes) {
      const availableSet = this.availableSpots.get(size);
      if (availableSet && availableSet.size > 0) {
        // Tomar el primer spot disponible (el id es único)
        const spotId = availableSet.values().next().value as string;
        return this.spots.get(spotId) || null;
      }
    }
    return null;
  }

  assignSpot(vehicle: Vehicle): ParkingSpot | null {
    const spot = this.findSpot(vehicle);
    if (!spot) return null;

    // Reservar el spot
    spot.assign(vehicle);
    // Eliminarlo del conjunto de disponibles
    this.availableSpots.get(spot.size)?.delete(spot.id);
    this.vehicleToSpot.set(vehicle.licensePlate, spot.id);
    return spot;
  }

  releaseSpot(licensePlate: string): void {
    const spotId = this.vehicleToSpot.get(licensePlate);
    if (!spotId) {
      throw new Error(`Vehicle ${licensePlate} not found`);
    }
    const spot = this.spots.get(spotId);
    if (!spot) {
      throw new Error(`Spot ${spotId} not found`);
    }
    spot.free();
    this.vehicleToSpot.delete(licensePlate);
    // Agregar de vuelta al conjunto de disponibles
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
    // Prioridad: del más ajustado al más grande
    switch (vehicleSize) {
      case VehicleSize.SMALL:
        return [VehicleSize.SMALL, VehicleSize.MEDIUM, VehicleSize.LARGE];
      case VehicleSize.MEDIUM:
        return [VehicleSize.MEDIUM, VehicleSize.LARGE];
      case VehicleSize.LARGE:
        return [VehicleSize.LARGE];
      default:
        return [];
    }
  }
}
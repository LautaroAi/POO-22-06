import { Driver } from '../models/Driver';
import { Location } from '../models/Location';

export class SupplyService {
  private drivers: Map<string, Driver> = new Map();
  private gridIndex: Map<string, Set<string>> = new Map(); // gridKey -> driverIds
  private gridSize: number = 0.1; // ~11 km

  addDriver(driver: Driver): void {
    this.drivers.set(driver.id, driver);
    this.indexDriver(driver);
  }

  private indexDriver(driver: Driver): void {
    const key = driver.currentLocation.getGridKey(this.gridSize);
    if (!this.gridIndex.has(key)) {
      this.gridIndex.set(key, new Set());
    }
    this.gridIndex.get(key)!.add(driver.id);
  }

  updateDriverLocation(driverId: string, location: Location): void {
    const driver = this.drivers.get(driverId);
    if (!driver) return;

    // Remover del índice viejo
    const oldKey = driver.currentLocation.getGridKey(this.gridSize);
    this.gridIndex.get(oldKey)?.delete(driverId);

    // Actualizar ubicación
    driver.updateLocation(location);

    // Re-indexar
    this.indexDriver(driver);
  }

  getAvailableDrivers(location: Location, radiusKm: number = 5): Driver[] {
    const gridRadius = Math.ceil(radiusKm / (this.gridSize * 111));
    const centerKey = location.getGridKey(this.gridSize);
    const [centerLat, centerLng] = centerKey.split(',').map(Number);

    const nearbyDrivers: Driver[] = [];

    for (let dl = -gridRadius; dl <= gridRadius; dl++) {
      for (let dlg = -gridRadius; dlg <= gridRadius; dlg++) {
        const gridKey = `${centerLat + dl},${centerLng + dlg}`;
        const driverIds = this.gridIndex.get(gridKey);
        if (driverIds) {
          for (const id of driverIds) {
            const driver = this.drivers.get(id);
            if (driver && driver.isAvailable && driver.currentLocation.distanceTo(location) <= radiusKm) {
              nearbyDrivers.push(driver);
            }
          }
        }
      }
    }

    // Ordenar por distancia
    return nearbyDrivers.sort((a, b) =>
      a.currentLocation.distanceTo(location) - b.currentLocation.distanceTo(location)
    );
  }

  getDriver(id: string): Driver | undefined {
    return this.drivers.get(id);
  }
}
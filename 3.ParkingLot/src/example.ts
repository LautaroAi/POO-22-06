import { ParkingLotFacade } from './facade/ParkingLotFacade';
import { ParkingLotFactory } from './factory/ParkingLotFactory';
import { ParkingManager } from './manager/ParkingManager';
import { HourlyPricing } from './pricing/HourlyPricing';
import { Car } from './models/Car';
import { Motorcycle } from './models/Motorcycle';
import { Truck } from './models/Truck';

// 1. Crear la estructura del estacionamiento usando Abstract Factory
const config = {
  levels: 2,
  rowsPerLevel: 3,
  spotsPerRow: {
    small: 2,
    medium: 2,
    large: 1
  }
};
const spots = ParkingLotFactory.createParkingLot(config);

// 2. Inicializar el manager y añadir los spots
const manager = new ParkingManager();
spots.forEach(spot => manager.addSpot(spot));

// 3. Crear la fachada con estrategia de precios
const pricing = new HourlyPricing(5); // $5 por hora
const parkingLot = new ParkingLotFacade(manager, pricing);

console.log('=== ESTACIONAMIENTO CREADO ===');
console.log(parkingLot.getStatus());

// 4. Simular entrada de vehículos
console.log('\n--- ENTRADA DE VEHÍCULOS ---');
const car = new Car('ABC-123');
const ticket1 = parkingLot.enter(car);

const bike = new Motorcycle('XYZ-789');
const ticket2 = parkingLot.enter(bike);

const truck = new Truck('TRK-001');
const ticket3 = parkingLot.enter(truck);

console.log(parkingLot.getStatus());

// 5. Simular salida después de un tiempo (modificamos el ticket para simular tiempo)
// Para la demo, forzamos el tiempo de salida manualmente (en realidad, el tiempo real pasa)
console.log('\n--- SALIDA DE VEHÍCULOS ---');
setTimeout(async () => {
  try {
    const total = await parkingLot.exit(ticket1.id);
    console.log(`Ticket ${ticket1.id} pagado: $${total.toFixed(2)}`);
    console.log(parkingLot.getStatus());
  } catch (err) {
    console.error(err);
  }
}, 1000);

// Esperar a que termine la salida antes de continuar
setTimeout(async () => {
  try {
    await parkingLot.exit(ticket2.id);
    console.log(parkingLot.getStatus());
  } catch (err) {
    console.error(err);
  }
}, 2000);

setTimeout(async () => {
  try {
    await parkingLot.exit(ticket3.id);
    console.log(parkingLot.getStatus());
  } catch (err) {
    console.error(err);
  }
}, 3000);
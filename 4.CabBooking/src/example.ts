import { CabBookingFacade } from './facade/CabBookingFacade';
import { Location } from './models/Location';
import { VehicleType } from './models/VehicleType';
import { SurgePricing } from './services/pricing/SurgePricing';
import { Driver } from './models/Driver'; 

async function main() {
  const app = new CabBookingFacade();

  // 1. Registrar conductores
  const driver1 = app.registerDriver('D1', 'Carlos', VehicleType.SEDAN, new Location(-33.45, -70.65));
  const driver2 = app.registerDriver('D2', 'María', VehicleType.PICKUP, new Location(-33.46, -70.66));
  const driver3 = app.registerDriver('D3', 'Juan', VehicleType.CUPE, new Location(-33.44, -70.64));

  // 2. Registrar pasajero
  const passenger = app.registerPassenger('P1', 'Ana', new Location(-33.45, -70.65));

  console.log('=== CONDUCTORES DISPONIBLES ===');
  const nearby = app.getNearbyDrivers(passenger.currentLocation, 2);
  console.log(nearby.map((d: Driver) => `${d.name} (${d.vehicleType})`));

  // 3. Solicitar viaje
  console.log('\n=== SOLICITANDO VIAJE ===');
  const trip = app.requestTrip(
    'P1',
    new Location(-33.45, -70.65),
    new Location(-33.50, -70.70),
    new SurgePricing(1.2)
  );

  console.log(`Trip ${trip.id} creado, conductor asignado: ${trip.driver?.name}`);

  // 4. Iniciar viaje
  console.log('\n=== INICIANDO VIAJE ===');
  app.startTrip(trip.id);

  // Simular tiempo de viaje
  console.log('\n=== ESPERANDO 2 SEGUNDOS PARA COMPLETAR ===');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. Completar viaje
  console.log('\n=== COMPLETANDO VIAJE ===');
  app.completeTrip(trip.id);

  // 6. Estado final
  console.log('\n=== ESTADO FINAL ===');
  const finalTrip = app.getTrip(trip.id);
  console.log(`Trip ${finalTrip?.id}, Estado: ${finalTrip?.status}, Tarifa: $${finalTrip?.fare.toFixed(2)}`);
}

main().catch(console.error);
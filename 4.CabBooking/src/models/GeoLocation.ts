export class GeoLocation {
  constructor(
    public readonly lat: number,
    public readonly lng: number
  ) {}

  distanceTo(other: GeoLocation): number {
    // Fórmula simplificada de distancia euclidiana (en km, aproximada)
    const latDiff = this.lat - other.lat;
    const lngDiff = this.lng - other.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // 1° ≈ 111 km
  }

  getGridKey(gridSize: number = 0.1): string {
    const latGrid = Math.floor(this.lat / gridSize);
    const lngGrid = Math.floor(this.lng / gridSize);
    return `${latGrid},${lngGrid}`;
  }
}
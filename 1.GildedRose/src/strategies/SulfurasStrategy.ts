import { Item } from '../Item';
import { QualityUpdateStrategy } from './QualityUpdateStrategy';

export class SulfurasStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    // Sulfuras no cambia nunca, ni siquiera sellIn
    // no hacemos nada
  }
}
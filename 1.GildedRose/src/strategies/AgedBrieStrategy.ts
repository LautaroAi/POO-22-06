import { Item } from '../Item';
import { QualityUpdateStrategy } from './QualityUpdateStrategy';

export class AgedBrieStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    if (item.quality < 50) {
      item.quality += 1;
    }
    if (item.sellIn < 0 && item.quality < 50) {
      item.quality += 1; // envejece más rápido después de la fecha
    }
  }
}
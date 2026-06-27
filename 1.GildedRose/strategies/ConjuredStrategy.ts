import { Item } from '../Item';
import { QualityUpdateStrategy } from './QualityUpdateStrategy';

export class ConjuredStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    const degradation = item.sellIn < 0 ? 4 : 2;
    item.quality = Math.max(0, item.quality - degradation);
  }
}
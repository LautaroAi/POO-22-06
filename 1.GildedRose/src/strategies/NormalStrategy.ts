import { Item } from '../Item';
import { QualityUpdateStrategy } from './QualityUpdateStrategy';

export class NormalStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    const degradation = item.sellIn < 0 ? 2 : 1;
    item.quality = Math.max(0, item.quality - degradation);
  }
}
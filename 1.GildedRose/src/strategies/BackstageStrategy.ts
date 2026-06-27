import { Item } from '../Item';
import { QualityUpdateStrategy } from './QualityUpdateStrategy';

export class BackstageStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    if (item.quality < 50) {
      if (item.sellIn <= 5) {
        item.quality += 3;
      } else if (item.sellIn <= 10) {
        item.quality += 2;
      } else {
        item.quality += 1;
      }
      // cap superior
      if (item.quality > 50) item.quality = 50;
    }
    item.sellIn -= 1;
    if (item.sellIn < 0) {
      item.quality = 0;
    }
  }
}
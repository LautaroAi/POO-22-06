import { Item } from './Item';
import { StrategyFactory } from './StrategyFactory';

export class GildedRose {
  private items: Item[];

  constructor(items: Item[]) {
    this.items = items;
  }

  updateQuality(): Item[] {
    for (const item of this.items) {
      const strategy = StrategyFactory.create(item.name);
      strategy.update(item);
    }
    return this.items;
  }
}
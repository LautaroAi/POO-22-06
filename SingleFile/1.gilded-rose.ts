// 1. El Kata "Gilded Rose" con Strategy + Factory

// clase base inmutable
class Item {
  public name: string;
  public sellIn: number;
  public quality: number;
  constructor(name: string, sellIn: number, quality: number) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

// interfaz común
interface QualityUpdateStrategy {
  update(item: Item): void;
}

// estrategias concretas
class NormalStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    const degradation = item.sellIn < 0 ? 2 : 1;
    item.quality = Math.max(0, item.quality - degradation);
  }
}

class AgedBrieStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    if (item.quality < 50) item.quality += 1;
    if (item.sellIn < 0 && item.quality < 50) item.quality += 1;
  }
}

class SulfurasStrategy implements QualityUpdateStrategy {
  update(_item: Item): void { /* no cambia nada */ }
}

class BackstageStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    if (item.quality < 50) {
      if (item.sellIn <= 5) item.quality += 3;
      else if (item.sellIn <= 10) item.quality += 2;
      else item.quality += 1;
      if (item.quality > 50) item.quality = 50;
    }
    item.sellIn -= 1;
    if (item.sellIn < 0) item.quality = 0;
  }
}

class ConjuredStrategy implements QualityUpdateStrategy {
  update(item: Item): void {
    item.sellIn -= 1;
    const degradation = item.sellIn < 0 ? 4 : 2;
    item.quality = Math.max(0, item.quality - degradation);
  }
}

// fábrica de estrategias
class StrategyFactory {
  static create(itemName: string): QualityUpdateStrategy {
    const name = itemName.toLowerCase();
    if (name.includes('aged brie')) return new AgedBrieStrategy();
    if (name.includes('sulfuras')) return new SulfurasStrategy();
    if (name.includes('backstage passes')) return new BackstageStrategy();
    if (name.includes('conjured')) return new ConjuredStrategy();
    return new NormalStrategy();
  }
}

// GildedRose - orquestador que usa la fábrica y aplica estrategias
class GildedRose {
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

// ejemplo de uso
const items = [
  new Item('Normal Item', 10, 20),
  new Item('Aged Brie', 2, 0),
  new Item('Sulfuras, Hand of Ragnaros', 0, 80),
  new Item('Backstage passes to a Eminem concert', 15, 20),
  new Item('Conjured Mana Cake', 3, 6),
];
const app = new GildedRose(items);
console.log('--- DÍA 0 ---');
console.log(JSON.stringify(items, null, 2));
for (let day = 1; day <= 5; day++) {
  app.updateQuality();
  console.log(`--- DÍA ${day} ---`);
  console.log(JSON.stringify(items, null, 2));
}
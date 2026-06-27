import { GildedRose } from '../GildedRose';
import { Item } from '../Item';

describe('GildedRose', () => {
  it('should degrade normal item correctly', () => {
    const items = [new Item('Normal', 5, 10)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(4);
    expect(items[0].quality).toBe(9);
  });

  it('should degrade normal item twice as fast after sellIn passes', () => {
    const items = [new Item('Normal', 0, 10)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(-1);
    expect(items[0].quality).toBe(8);
  });

  it('should never make quality negative', () => {
    const items = [new Item('Normal', 0, 1)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].quality).toBe(0);
  });

  it('should increase Aged Brie quality', () => {
    const items = [new Item('Aged Brie', 2, 0)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(1);
    expect(items[0].quality).toBe(1);
  });

  it('should not increase Aged Brie above 50', () => {
    const items = [new Item('Aged Brie', 2, 50)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].quality).toBe(50);
  });

  it('should never change Sulfuras', () => {
    const items = [new Item('Sulfuras, Hand of Ragnaros', 10, 80)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(10);
    expect(items[0].quality).toBe(80);
  });

  it('should update Backstage passes correctly', () => {
    const items = [
      new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20),
      new Item('Backstage passes to a TAFKAL80ETC concert', 10, 20),
      new Item('Backstage passes to a TAFKAL80ETC concert', 5, 20),
    ];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].quality).toBe(21); // +1
    expect(items[1].quality).toBe(22); // +2
    expect(items[2].quality).toBe(23); // +3
  });

  it('should drop Backstage quality to 0 after concert', () => {
    const items = [new Item('Backstage passes to a TAFKAL80ETC concert', 0, 20)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(-1);
    expect(items[0].quality).toBe(0);
  });

  it('should degrade Conjured items twice as fast', () => {
    const items = [new Item('Conjured Mana Cake', 3, 6)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(2);
    expect(items[0].quality).toBe(4); // degrada en 2
  });

  it('should degrade Conjured items four times as fast after sellIn', () => {
    const items = [new Item('Conjured Mana Cake', 0, 6)];
    const gildedRose = new GildedRose(items);
    gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(-1);
    expect(items[0].quality).toBe(2); // degrada en 4
  });
});
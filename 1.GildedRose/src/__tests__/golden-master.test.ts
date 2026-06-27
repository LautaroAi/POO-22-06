import { GildedRose } from '../GildedRose';
import { Item } from '../Item';

describe('Golden Master', () => {
  it('should match the legacy behavior for many random items over 30 days', () => {
    // Generamos un conjunto fijo de items representativos
    const items = [
      new Item('Normal Item', 10, 20),
      new Item('Aged Brie', 2, 0),
      new Item('Sulfuras, Hand of Ragnaros', 0, 80),
      new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20),
      new Item('Conjured Mana Cake', 3, 6),
    ];

    const gildedRose = new GildedRose(items);
    const history: Item[][] = [];

    for (let day = 0; day < 30; day++) {
      history.push(items.map(item => ({ ...item }))); // clonar para snapshot
      gildedRose.updateQuality();
    }

    // Guardamos el snapshot (la primera ejecución generará el archivo)
    expect(history).toMatchSnapshot();
  });
});
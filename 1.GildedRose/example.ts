import { GildedRose } from './GildedRose';
import { Item } from './Item';

// Simulamos el inventario inicial
const items = [
  new Item('Normal Item', 10, 20),
  new Item('Aged Brie', 2, 0),
  new Item('Sulfuras, Hand of Ragnaros', 0, 80),
  new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20),
  new Item('Conjured Mana Cake', 3, 6),
];

const gildedRose = new GildedRose(items);

console.log('=== INVENTARIO INICIAL (Día 0) ===');
console.table(items);

// Simulamos 5 días de actualización
for (let day = 1; day <= 5; day++) {
  gildedRose.updateQuality();
  console.log(`\n=== DÍA ${day} ===`);
  console.table(items);
}
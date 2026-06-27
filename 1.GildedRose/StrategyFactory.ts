import { QualityUpdateStrategy } from './strategies/QualityUpdateStrategy';
import { NormalStrategy } from './strategies/NormalStrategy';
import { AgedBrieStrategy } from './strategies/AgedBrieStrategy';
import { SulfurasStrategy } from './strategies/SulfurasStrategy';
import { BackstageStrategy } from './strategies/BackstageStrategy';
import { ConjuredStrategy } from './strategies/ConjuredStrategy';

export class StrategyFactory {
  static create(itemName: string): QualityUpdateStrategy {
    const name = itemName.toLowerCase();
    if (name.includes('aged brie')) {
      return new AgedBrieStrategy();
    }
    if (name.includes('sulfuras')) {
      return new SulfurasStrategy();
    }
    if (name.includes('backstage passes')) {
      return new BackstageStrategy();
    }
    if (name.includes('conjured')) {
      return new ConjuredStrategy();
    }
    return new NormalStrategy();
  }
}
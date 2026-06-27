import { Item } from '../Item';

export interface QualityUpdateStrategy {
  update(item: Item): void;
}
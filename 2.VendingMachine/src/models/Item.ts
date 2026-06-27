export class Item {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly price: number,
    public quantity: number
  ) {}
}
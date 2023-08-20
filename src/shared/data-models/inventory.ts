import { Unique } from "./utility";

export interface InventoryItem extends Unique {
  readonly name: string;
}

export interface Egg extends InventoryItem {
  readonly hatchTime: number;
}

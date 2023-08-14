import { Unique } from "./utility";


export namespace InventoryItems {
  export function isEgg(item: InventoryItem): item is Egg {
    return "hatchTime" in item;
  }
}

export interface InventoryItem extends Unique {
  readonly name: string;
}

export interface Egg extends InventoryItem {
  readonly hatchTime: number;
}

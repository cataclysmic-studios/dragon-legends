import { Egg, InventoryItem } from "shared/data-models/inventory";
import Utility from "./base-utility";

export default class InventoryItemUtility extends Utility<InventoryItem> {
  public isEgg(v = this.data): v is Egg {
    return "hatchTime" in v;
  }
}
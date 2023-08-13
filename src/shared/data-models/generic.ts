import { InventoryItem } from "shared/data-models/inventory";
import { Dragon } from "shared/data-models/dragons";
import { TimeInfo } from "shared/data-models/time";
import { Building } from "shared/data-models/buildings";

export interface GameDataModel {
  timeInfo: TimeInfo;
  gold: number;
  diamonds: number;
  food: number;
  inventory: InventoryItem[]; // subject to change (obviously): eggs, perks, etc
  dragons: Dragon[];
  level: number;
  xp: number;
  buildings: Building[];
}

export type DataValue = GameDataModel[DataKey];
export type DataKey = keyof GameDataModel;

export const DataKeys: DataKey[] = [
  "timeInfo",
  "gold", "diamonds", "food",
  "inventory", "dragons",
  "level", "xp",
  "buildings"
];

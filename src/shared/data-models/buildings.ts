import { Unique, StorableVector3 } from "./utility";
import { Egg } from "shared/data-models/inventory";

export interface Building extends Unique {
  readonly name: string;
  position: StorableVector3;
}

export interface UpgradableBuilding extends Building {
  level: number;
}

export interface Hatchery extends UpgradableBuilding {
  eggs: Egg[];
}
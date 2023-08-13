import { Unique, StorableVector3 } from "./utility";
import { Egg } from "shared/data-models/inventory";
import { Dragon } from "shared/data-models/dragons";


export interface Building extends Unique {
  readonly name: string;
  position: StorableVector3;
}

export interface UpgradableBuilding extends Building {
  level: number;
}

export interface Habitat extends UpgradableBuilding {
  gold: number;
  dragons: Dragon[];
}

export interface Hatchery extends UpgradableBuilding {
  eggs: Egg[];
}

export namespace Buildings {
  export function isHatchery(building: Building): building is Hatchery {
    return "eggs" in building;
  }

  export function isHabitat(building: Building): building is Habitat {
    return "dragons" in building && "gold" in building && isUpgradable(building);
  }

  export function isUpgradable(building: Building): building is UpgradableBuilding {
    return "level" in building;
  }
}

import { Building, Hatchery, UpgradableBuilding } from "shared/data-models/buildings";
import { Habitat } from "shared/data-models/habitats";
import Utility from "./base-utility";

export default class BuildingUtility extends Utility<Building> {
  public isHatchery(v = this.data): v is Hatchery {
    return "eggs" in v;
  }

  public isHabitat(v = this.data): v is Habitat {
    return "dragonIDs" in v && "gold" in v && this.isUpgradable(v);
  }

  public isUpgradable(v = this.data): v is UpgradableBuilding {
    return "level" in v;
  }
}
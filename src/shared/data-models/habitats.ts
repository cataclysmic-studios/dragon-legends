import { Dragon } from "shared/data-models/dragons";
import { UpgradableBuilding } from "./buildings";

export interface Habitat extends UpgradableBuilding {
  gold: number;
  dragons: Dragon[];
}

export namespace Habitats {
  export function calculateTotalGoldPerMinute(habitat: Habitat): number {
    return habitat.dragons.size() > 0 ?
      habitat.dragons
        .map(d => d.goldGenerationRate)
        .reduce((accum, cur) => accum + cur)
      : 0;
  }
}
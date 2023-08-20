import { Habitat } from "shared/data-models/habitats";
import Utility from "./base-utility";

export default class HabitatUtility extends Utility<Habitat> {
  public calculateTotalGoldPerMinute(): number {
    return this.data.dragons.size() > 0 ?
      this.data.dragons
        .map(d => d.goldGenerationRate)
        .reduce((accum, cur) => accum + cur)
      : 0;
  }
}
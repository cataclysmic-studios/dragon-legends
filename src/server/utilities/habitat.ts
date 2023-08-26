import { Dependency } from "@flamework/core";
import { DragonDataService } from "server/services/data-management/dragon-data-service";
import { Habitat } from "shared/data-models/habitats";
import Utility from "shared/data-utilities/base-utility";

export default class HabitatUtility extends Utility<Habitat> {
  // server only
  public calculateTotalGoldPerMinute(player: Player): number {
    const dragonData = Dependency<DragonDataService>();
    return this.data.dragonIDs.size() > 0 ?
      this.data.dragonIDs
        .map(id => dragonData.get(player, id)!)
        .map(d => d.goldGenerationRate)
        .reduce((accum, cur) => accum + cur)
      : 0;
  }
}
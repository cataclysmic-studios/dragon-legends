import { Dragon } from "shared/data-models/dragons";
import { toNearestFiveOrTen } from "shared/utilities/helpers";
import Utility from "./base-utility";

const { floor, max } = math;

export default class DragonUtility extends Utility<Dragon> {
  public getLevel(): number {
    return floor(this.data.xp / 4) + 1;
  }

  public getCurrentLevelXP(): number {
    return this.data.xp % 4;
  }

  public getPower(): number {
    const { damage, health, xp, empowerment, goldGenerationRate, abilities } = this.data;
    const totalAbilityLevel = abilities
      .map(a => a.level)
      .reduce((accum, cur) => accum + cur);

    return floor((xp + damage + health) * (empowerment + 1)) + goldGenerationRate + totalAbilityLevel;
  }

  public calculateFeedingPrice(): number {
    const base = 5;
    const dampener = 2.5;
    const level = this.getLevel();
    return max(toNearestFiveOrTen(base * 1.5 ** (level - 1) / dampener), base);
  }
}
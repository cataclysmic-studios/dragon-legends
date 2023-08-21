import { OnStart, Service } from "@flamework/core";
import { PlayerDataService } from "./player-data-service";
import { Functions } from "server/network";

const { calculateXPUntilNextLevel } = Functions;

@Service()
export class LevelService implements OnStart {
  public constructor(
    private readonly data: PlayerDataService
  ) { }

  public onStart(): void {
    calculateXPUntilNextLevel.setCallback(player => this.calculateXPUntilNextLevel(player));
  }

  public addXP(player: Player, amount: number): void {
    const xp = this.data.get<number>(player, "xp");
    const xpUntilNext = this.calculateXPUntilNextLevel(player);

    if (xp >= xpUntilNext) {
      const diff = xp - xpUntilNext;
      this.addLevel(player);
      return this.addXP(player, diff);
    }

    this.data.increment(player, "xp", amount);
  }

  private calculateXPUntilNextLevel(player: Player): number {
    const level = this.data.get<number>(player, "level") + 1;
    return (level ** 2 + level) / 2 * 100 - (level * 100);
  }

  private addLevel(player: Player): void {
    this.data.increment(player, "level");
    this.data.set(player, "xp", 0);
  }
}
import { OnStart, Service } from "@flamework/core";
import { DataService } from "./data-service";
import { Functions } from "server/network";

const { calculateXPUntilNextLevel } = Functions;

@Service()
export class LevelService implements OnStart {
  public constructor(
    private readonly data: DataService
  ) {}

  public onStart(): void {
    calculateXPUntilNextLevel.setCallback(player => this.calculateXPUntilNextLevel(player));
  }
  
  private calculateXPUntilNextLevel(player: Player): number {
    const level = this.data.get<number>(player, "level");
    return (level ** 2 + level) / 2 * 100 - (level * 100);
  }

  public addXP(player: Player, amount: number): void {
    const xp = this.data.get<number>(player, "xp");
    const xpUntilNext = this.calculateXPUntilNextLevel(player);

    if (xp >= xpUntilNext) {
      const diff = xp - xpUntilNext;
      this.addLevel(player);
      this.addXP(player, diff);
      return;
    }

    this.data.increment(player, "xp", amount);
  }

  private addLevel(player: Player): void {
    this.data.increment(player, "level");
    this.data.set(player, "xp", 0);
  }
}
import { Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { OnPlayerJoin } from "shared/hooks";

@Service()
export class BuildingLoaderService implements OnPlayerJoin {
  public readonly onBuildingsLoaded = new Signal<(player: Player) => void>();

  public onPlayerJoin(player: Player): void {
    this.onBuildingsLoaded.Fire(player);
  }
}
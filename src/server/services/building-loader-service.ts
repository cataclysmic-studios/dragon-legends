import { Dependency, OnStart, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { DataService } from "./data-service";
import { Building, Buildings } from "shared/data-models";
import { Assets, getDragonData, toUsableVector3 } from "shared/util";
import { Events } from "server/network";

@Service()
export class BuildingLoaderService implements OnStart {
  public readonly onBuildingsLoaded = new Signal<(player: Player) => void>();
  
  private readonly data = Dependency<DataService>();

  public onStart(): void {
    Events.dataLoaded.connect(player => {
      const buildings = this.data.get<Building[]>(player, "buildings");
      for (const building of buildings)
        this.loadBuilding(player, building);

      this.onBuildingsLoaded.Fire(player);
    });
  }

  private loadBuilding(player: Player, info: Building): void {
    let category: Exclude<keyof typeof Assets, keyof Folder | "UI">;
    if (Buildings.isHabitat(info)) {
      category = "Habitats";
      for (const dragon of info.dragons) {
        const dragonModel = <Model>Assets.Dragons.WaitForChild(dragon.name);
        const dragonData = getDragonData(dragonModel);
        Events.placeDragon.predict(player, dragonData, info.id);
      }
    } else
      category = "Buildings";

    Events.placeBuilding.predict(player, info.name, category, toUsableVector3(info.position), info.id)
  }
}
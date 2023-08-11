import { Dependency, OnStart, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { DataService } from "./data-service";
import { BuildingInfo, Buildings } from "shared/data-models";
import { Assets, toUsableVector3 } from "shared/util";
import { Events } from "server/network";
import { Workspace as World } from "@rbxts/services";

@Service()
export class BuildingLoaderService implements OnStart {
  public readonly onBuildingsLoaded = new Signal<(player: Player) => void>();
  
  private readonly data = Dependency<DataService>();

  public onStart(): void {
    Events.dataLoaded.connect(player => {
      const buildings = this.data.get<BuildingInfo[]>(player, "buildings");
      for (const building of buildings)
        this.loadBuilding(building);

      this.onBuildingsLoaded.Fire(player);
    });
  }

  private loadBuilding(info: BuildingInfo): void {
    let category: Exclude<keyof typeof Assets, keyof Folder | "UI">;
    if (Buildings.isHabitat(info))
      category = "Habitats";
    else
      category = "Buildings";

    const model = <Model>Assets[category].WaitForChild(info.name);
    model.PrimaryPart!.Position = toUsableVector3(info.position);
    model.SetAttribute("ID", info.id);
    model.Parent = World.Buildings;
  }
}
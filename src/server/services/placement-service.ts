import { Service, OnInit, Dependency } from "@flamework/core";
import { HttpService as HTTP, Workspace as World } from "@rbxts/services";
import { Events } from "server/network";
import { Assets, BuildingCategory } from "shared/util";
import { DataService } from "./data-service";
import { BuildingInfo, HabitatInfo } from "shared/data-models";
import { TimerService } from "./timer-service";

@Service()
export class PlacementService implements OnInit {
  private readonly data = Dependency<DataService>();
  private readonly timer = Dependency<TimerService>();

  public onInit(): void {
    Events.placeBuilding.connect((player, buildingName, category, position) => 
      this.placeBuilding(player, buildingName, category, position)
    );
  }

  private saveBuildingInfo(
    player: Player,
    id: string,
    name: string,
    category: BuildingCategory,
    position: Vector3
  ): void {

    const buildings = this.data.get<BuildingInfo[]>(player, "buildings");
    switch (category) {
      case "Habitats": {
        const info: HabitatInfo = {
          id, name, position,
          level: 1,
          gold: 0,
          dragons: []
        }
        
        buildings.push(info);
        break;
      }
    }
    
    this.timer.addBuildingTimer(player, id);
    this.data.set(player, "buildings", buildings);
  }

  public placeBuilding(
    player: Player,
    buildingName: string,
    category: BuildingCategory,
    position: Vector3
  ): void {

    const building = Assets[category][buildingName].Clone();
    building.PrimaryPart!.Position = position;
    building.Parent = World.Buildings;

    const id = HTTP.GenerateGUID();
    this.saveBuildingInfo(player, id, buildingName, category, position);
    building.SetAttribute("ID", id);
  }
}
import { Service, OnInit, Dependency } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Events } from "server/network";
import { Assets, BuildingCategory } from "shared/util";
import { DataService } from "./data-service";
import { BuildingInfo, HabitatInfo } from "shared/data-models";

@Service()
export class PlacementService implements OnInit {
  private readonly data = Dependency<DataService>();

  public onInit(): void {
    Events.placeBuilding.connect((player, buildingName, category, position) => 
      this.placeBuilding(player, buildingName, category, position)
    );
  }

  private saveBuildingInfo(
    player: Player,
    buildingName: string,
    category: BuildingCategory,
    position: Vector3
  ): void {

    const buildings = this.data.get<BuildingInfo[]>(player, "buildings");
    switch (category) {
      case "Habitats": {
        const info: HabitatInfo = {
          name: buildingName,
          position: position,
          level: 1,
          gold: 0,
          dragons: []
        }
        
        buildings.push(info);
        break;
      }
    }

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

    this.saveBuildingInfo(player, buildingName, category, position);
  }
}
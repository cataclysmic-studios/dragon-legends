import { Service, OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Events } from "server/network";
import { Assets, BuildingCategory } from "shared/util";

@Service()
export class PlacementService implements OnInit {
  public onInit(): void {
    Events.placeBuilding.connect((_, buildingName, category, position, islandName) => 
      this.placeBuilding(buildingName, category, position, islandName)
    );
  }

  public placeBuilding(
    buildingName: string,
    category: BuildingCategory,
    position: Vector3,
    islandName: string
  ): void {
    
    const building = Assets[category][buildingName].Clone();
    building.SetAttribute("Island", islandName);
    building.PrimaryPart!.Position = position;
    building.Parent = World.Buildings;
  }
}
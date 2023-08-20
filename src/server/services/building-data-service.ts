import { Service, OnInit } from "@flamework/core";
import { Functions } from "server/network";
import { Building, Hatchery } from "shared/data-models/buildings";
import { DataService } from "./data-service";

const { getBuildingData } = Functions;

@Service()
export class BuildingDataService implements OnInit {
  public constructor(
    private readonly data: DataService
  ) { }

  public onInit(): void {
    getBuildingData.setCallback((player, id) => this.get(player, id));
  }

  public update(player: Player, building: Building): void {
    this.remove(player, building.id);
    this.add(player, building);
  }

  public add(player: Player, building: Building): void {
    const buildings = this.data.get<Building[]>(player, "buildings");
    buildings.push(building);
    this.data.set(player, "buildings", buildings);
  }

  public remove(player: Player, buildingID: string): void {
    const newBuildings = this.data
      .get<Building[]>(player, "buildings")
      .filter(b => b.id !== buildingID);

    this.data.set(player, "buildings", newBuildings);
  }

  public get<T extends Building = Building>(player: Player, buildingID: string): T extends Hatchery ? T : Maybe<T> {
    return <T extends Hatchery ? T : Maybe<T>>this.data
      .get<Building[]>(player, "buildings")
      .find(building => building.id === buildingID);
  }
}
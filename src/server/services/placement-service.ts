import { Service, OnInit } from "@flamework/core";
import { HttpService as HTTP, RunService as Runtime, Workspace as World } from "@rbxts/services";

import { BuildingDataService } from "./data-management/building-data-service";
import { DragonDataService } from "./data-management/dragon-data-service";
import { TimerService } from "./data-management/timer-service";
import { HabitatService } from "./buildings/habitat-service";

import { DragonInfo } from "shared/data-models/dragons";
import { Habitat } from "shared/data-models/habitats";
import { createDefaultDragon } from "shared/data-models/defaults";
import { MissingBuildingException } from "shared/exceptions";
import { Assets, Placable, toStorableVector3, toSeconds, getPlacedBuilding, newDragonModel } from "shared/utilities/helpers";
import { Events } from "server/network";

const { placeBuilding, placeDragon } = Events;

@Service()
export class PlacementService implements OnInit {
  public constructor(
    private readonly buildingData: BuildingDataService,
    private readonly dragonData: DragonDataService,
    private readonly timer: TimerService,
    private readonly habitat: HabitatService
  ) { }

  public onInit(): void {
    placeDragon.connect((player, dragonData, habitatID, idOverride) =>
      this.placeDragon(player, dragonData, habitatID, idOverride)
    );
    placeBuilding.connect((player, buildingName, category, position, idOverride) =>
      this.placeBuilding(player, buildingName, category, position, idOverride)
    );
  }

  public placeDragon(
    player: Player,
    dragonData: DragonInfo,
    habitatID: string,
    idOverride?: string
  ): void {

    const habitat = getPlacedBuilding<HabitatModel>(habitatID);
    if (!habitat)
      throw new MissingBuildingException(habitatID, `Could not find habitat when placing dragon "${dragonData.name}"`);

    const id = idOverride ?? HTTP.GenerateGUID();
    newDragonModel(dragonData.name, {
      position: habitat.PrimaryPart!.Position,
      parent: habitat.Dragons,
      attributes: { ID: id }
    });

    if (idOverride) return;
    this.saveDragonInfo(player, id, dragonData, habitatID);
  }

  public placeBuilding(
    player: Player,
    buildingName: string,
    category: Placable,
    position: Vector3,
    idOverride?: string
  ): void {

    const id = idOverride ?? HTTP.GenerateGUID();
    const building = <Model>Assets.WaitForChild(category).WaitForChild(buildingName).Clone();
    building.PrimaryPart!.Position = position;
    building.Parent = World.Buildings;
    building.SetAttribute("ID", id);

    if (idOverride) return;
    const timerLength = Runtime.IsStudio() ?
      "5 seconds" :
      building.GetAttribute<string>("PlacementTime");

    this.saveBuildingInfo(player, id, buildingName, category, position, toSeconds(timerLength));
  }

  private saveDragonInfo(
    player: Player,
    id: string,
    { name, elements, rarity }: DragonInfo,
    habitatID: string
  ): void {

    const dragon = createDefaultDragon(id, name, elements, rarity, habitatID);
    this.dragonData.add(player, dragon);
  }

  private saveBuildingInfo(
    player: Player,
    id: string,
    name: string,
    category: Placable,
    position: Vector3,
    timerLength: number
  ): void {

    switch (category) {
      case "Habitats": {
        const habitat: Habitat = {
          id, name,
          position: toStorableVector3(position),
          level: 1,
          gold: 0,
          dragonIDs: []
        }

        this.buildingData.add(player, habitat);
        this.habitat.updateGoldGeneration(player, habitat);
        break;
      }
    }

    this.timer.addBuildingTimer(player, id, timerLength);
  }
}
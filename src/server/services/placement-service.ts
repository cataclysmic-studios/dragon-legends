import { Service, OnInit } from "@flamework/core";
import { HttpService as HTTP, RunService as Runtime, Workspace as World } from "@rbxts/services";

import { DataService } from "./data-service";
import { TimerService } from "./timer-service";
import { HabitatService } from "./buildings/habitat-service";

import { Dragon, DragonInfo } from "shared/data-models/dragons";
import { Building, Habitat } from "shared/data-models/buildings";
import { MissingBuildingException } from "shared/exceptions";
import { Assets, Placable, toStorableVector3, toSeconds, getPlacedBuilding, newDragonModel } from "shared/util";
import { Events } from "server/network";

const { placeBuilding, placeDragon } = Events;

@Service()
export class PlacementService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly timer: TimerService,
    private readonly habitat: HabitatService
  ) {}  

  public onInit(): void {
    placeDragon.connect((player, dragonData, habitatID) =>
      this.placeDragon(player, dragonData, habitatID)
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

    const buildings = this.data.get<Building[]>(player, "buildings");
    const dragons = this.data.get<Dragon[]>(player, "dragons");
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID)!;
    const dragon: Dragon = {
      id, name, elements, rarity,
      damage: 100,
      health: 500,
      goldGenerationRate: 10,
      empowerment: 0,
      power: 5,
      combatBadge: "None",

      perks: {
        character: [],
        combat1: [],
        combat2: []
      },

      abilities: [
        {
          element: "Physical",
          level: 1,
          damage: 100
        }, {
          element: "Inferno",
          level: 1,
          damage: 250
        }, {
          element: "Physical",
          level: 1,
          damage: 150
        }, {
          element: "Inferno",
          level: 1,
          damage: 150
        }
      ]
    };

    habitat.dragons = [...habitat.dragons, dragon ];

    const newBuildings = buildings.filter(b => b.id !== habitatID);
    newBuildings.push(habitat);
    dragons.push(dragon);

    this.data.set(player, "buildings", newBuildings);
    this.data.set(player, "dragons", dragons);
  }

  private saveBuildingInfo(
    player: Player,
    id: string,
    name: string,
    category: Placable,
    position: Vector3,
    timerLength: number
  ): void {

    const buildings = this.data.get<Building[]>(player, "buildings");
    switch (category) {
      case "Habitats": {
        const habitat: Habitat = {
          id, name,
          position: toStorableVector3(position),
          level: 1,
          gold: 0,
          dragons: []
        }
        
        buildings.push(habitat);
        this.habitat.updateGoldGeneration(player, habitat);
        break;
      }
    }
    
    this.data.set(player, "buildings", buildings);
    this.timer.addBuildingTimer(player, id, timerLength);
  }
}
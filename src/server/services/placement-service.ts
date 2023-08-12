import { Service, OnInit } from "@flamework/core";
import { HttpService as HTTP, Workspace as World } from "@rbxts/services";

import { DataService } from "./data-service";
import { TimerService } from "./timer-service";
import { Assets, Placable, toStorableVector3, toSeconds, getBuildingModel } from "shared/util";
import { Building, Dragon, DragonInfo, Habitat } from "shared/data-models";
import { Events } from "server/network";
import { MissingBuildingException } from "shared/exceptions";

const { placeBuilding, placeDragon } = Events;

@Service()
export class PlacementService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly timer: TimerService
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

    const habitat = getBuildingModel<HabitatModel>(habitatID);

    if (!habitat)
      throw new MissingBuildingException(habitatID, `Could not find habitat when placing dragon "${dragonData.name}"`);

    const id = idOverride ?? HTTP.GenerateGUID();
    const dragonModel = <Model>Assets.Dragons.WaitForChild(dragonData.name);
    const offset = new Vector3(0, dragonModel.PrimaryPart!.Size.Y / 2, 0);
    dragonModel.PrimaryPart!.Position = habitat.PrimaryPart!.Position.add(offset);
    dragonModel.Parent = habitat.Dragons;
    dragonModel.SetAttribute("ID", id);

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
    const timerLength = building.GetAttribute<string>("PlacementTime");
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
    const habitat = this.data.findBuilding<Habitat>(player, habitatID)!;
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
    newBuildings.push(habitat)
    dragons.push(dragon);

    this.data.set(player, "buildings", buildings);
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
        const info: Habitat = {
          id, name,
          position: toStorableVector3(position),
          level: 1,
          gold: 0,
          dragons: []
        }
        
        buildings.push(info);
        break;
      }
    }
    
    this.data.set(player, "buildings", buildings);
    this.timer.addBuildingTimer(player, id, timerLength);
  }
}
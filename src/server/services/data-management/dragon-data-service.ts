import { Service, OnInit } from "@flamework/core";
import { DataService } from "./data-service";
import { BuildingDataService } from "./building-data-service";

import { Dragon } from "shared/data-models/dragons";
import { Habitat } from "shared/data-models/habitats";
import { Events, Functions } from "server/network";
import { Exception, MissingDataException } from "shared/exceptions";

const { addDragonXP } = Events;
const { getDragonData } = Functions;

const { clamp } = math;

@Service()
export class DragonDataService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly buildingData: BuildingDataService
  ) { }

  public onInit(): void {
    getDragonData.setCallback((player, dragonID) => this.get(player, dragonID));
    addDragonXP.connect((player, id) => {
      const dragon = this.get(player, id);
      if (!dragon) return;
      dragon.xp++;
      dragon.xp = clamp(dragon.xp, 0, (40 + (dragon.empowerment * 5)) * 4)
      this.update(player, dragon);
    });
  }

  public update(player: Player, dragon: Dragon): void {
    this.remove(player, dragon.id);
    this.add(player, dragon);
  }

  public add(player: Player, dragon: Dragon): void {
    const habitat = this.buildingData.get<Habitat>(player, dragon.habitatID)!;
    const dragons = this.data.get<Dragon[]>(player, "dragons");
    habitat.dragonIDs = [...habitat.dragonIDs, dragon.id];
    dragons.push(dragon);
    this.data.set(player, "dragons", dragons);
    this.buildingData.update(player, habitat);
  }

  public remove(player: Player, dragonID: string): void {
    const dragon = this.get(player, dragonID);
    if (!dragon)
      throw new MissingDataException(dragonID, "Attempt to remove non-existent dragon data");

    const habitat = this.buildingData.get<Habitat>(player, dragon.habitatID)!;
    const newDragons = this.data
      .get<Dragon[]>(player, "dragons")
      .filter(d => d.id !== dragonID);

    habitat.dragonIDs = habitat.dragonIDs
      .filter(id => id !== dragonID);

    this.data.set(player, "dragons", newDragons);
    this.buildingData.update(player, habitat);
  }

  public get(player: Player, dragonID: string): Maybe<Dragon> {
    return this.data
      .get<Dragon[]>(player, "dragons")
      .find(dragon => dragon.id === dragonID);
  }
}
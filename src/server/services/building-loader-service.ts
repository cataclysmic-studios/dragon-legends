import { OnStart, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { DataService } from "./data-service";

import { Building, Buildings, Habitat } from "shared/data-models/buildings";
import { TimeInfo } from "shared/data-models/time";
import { Assets, getDragonData, getTotalGoldPerMinute, now, toUsableVector3 } from "shared/util";
import { Events } from "server/network";
import { HabitatService } from "./buildings/habitat-service";

const { dataLoaded, placeBuilding, placeDragon, buildingsLoaded, addEggToHatchery } = Events;
const { isHabitat, isHatchery } = Buildings;
const { floor } = math;

type BuildingCategory = Exclude<keyof typeof Assets, keyof Folder | "UI" | "Eggs">;

@Service()
export class BuildingLoaderService implements OnStart {
  public readonly onBuildingsLoaded = new Signal<(player: Player) => void>();

  public constructor(
    private readonly data: DataService,
    private readonly habitats: HabitatService
  ) { }

  public onStart(): void {
    const conn = dataLoaded.connect(player => {
      const buildings = this.data.get<Building[]>(player, "buildings");
      for (const building of buildings)
        this.loadBuilding(player, building);

      this.onBuildingsLoaded.Fire(player);
      buildingsLoaded(player, buildings);
      conn.Disconnect();
    });
  }

  private loadBuilding(player: Player, building: Building): void {
    placeBuilding.predict(
      player, building.name,
      this.getBuildingCategory(building),
      toUsableVector3(building.position),
      building.id
    );

    if (isHabitat(building))
      this.loadHabitat(player, building);
    else if (isHatchery(building))
      for (const egg of building.eggs)
        addEggToHatchery.predict(player, egg, true);
  }

  private getBuildingCategory(building: Building): BuildingCategory {
    let category: BuildingCategory = "Buildings";
    if (isHabitat(building))
      category = "Habitats";

    return category;
  }

  private loadHabitat(player: Player, habitat: Habitat) {
    const { id, dragons } = habitat;
    for (const dragon of dragons) {
      const dragonModel = <Model>Assets.Dragons.WaitForChild(dragon.name);
      const dragonData = getDragonData(dragonModel);
      placeDragon.predict(player, dragonData, id, dragon.id);
    }

    const { lastOnline } = this.data.get<TimeInfo>(player, "timeInfo");
    const perMinuteGold = getTotalGoldPerMinute(habitat);
    const secondsOffline = lastOnline ? now() - lastOnline : 0;
    const minutesOffline = secondsOffline / 60;
    const gainedGold = floor(perMinuteGold * minutesOffline);
    this.habitats.addGold(player, id, gainedGold);
  }
}
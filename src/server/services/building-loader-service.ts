import { OnInit, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { PlayerDataService } from "./data-management/player-data-service";
import { DragonDataService } from "./data-management/dragon-data-service";
import { HabitatService } from "./buildings/habitat-service";

import { Building } from "shared/data-models/buildings";
import { Habitat } from "shared/data-models/habitats";
import { TimeInfo } from "shared/data-models/time";
import { Assets, getStaticDragonInfo, now, toUsableVector3 } from "shared/utilities/helpers";
import BuildingUtility from "shared/utilities/building";
import HabitatUtility from "server/utilities/habitat";

import { Events } from "server/network";
import { Janitor } from "@rbxts/janitor";

const { dataLoaded, placeBuilding, placeDragon, buildingsLoaded, addEggToHatchery } = Events;
const { floor } = math;

type BuildingCategory = Exclude<keyof typeof Assets, keyof Folder | "UI" | "Eggs">;

@Service()
export class BuildingLoaderService implements OnInit {
  public readonly onBuildingsLoaded = new Signal<(player: Player) => void>();

  private readonly janitor = new Janitor;

  public constructor(
    private readonly data: PlayerDataService,
    private readonly dragonData: DragonDataService,
    private readonly habitats: HabitatService
  ) { }

  public onInit(): void {
    this.janitor.Add(dataLoaded.connect(player => {
      const buildings = this.data.get<Building[]>(player, "buildings");
      for (const building of buildings)
        task.spawn(() => this.loadBuilding(player, building));

      this.onBuildingsLoaded.Fire(player);
      buildingsLoaded(player, buildings);
      this.janitor.Cleanup();
    }));
  }

  private loadBuilding(player: Player, building: Building): void {
    placeBuilding.predict(
      player, building.name,
      this.getBuildingCategory(building),
      toUsableVector3(building.position),
      building.id
    );

    const buildingUtil = new BuildingUtility(building);
    if (buildingUtil.isHabitat(building))
      this.loadHabitat(player, building);
    else if (buildingUtil.isHatchery(building))
      for (const egg of building.eggs)
        addEggToHatchery.predict(player, egg, true);
  }

  private getBuildingCategory(building: Building): BuildingCategory {
    const buildingUtil = new BuildingUtility(building);
    let category: BuildingCategory = "Buildings";
    if (buildingUtil.isHabitat())
      category = "Habitats";

    return category;
  }

  private loadHabitat(player: Player, habitat: Habitat) {
    const { id, dragonIDs } = habitat;
    for (const dragonID of dragonIDs)
      task.spawn(() => {
        const dragon = this.dragonData.get(player, dragonID)!;
        const dragonModel = <Model>Assets.Dragons.WaitForChild(dragon.name);
        const dragonData = getStaticDragonInfo(dragonModel);
        placeDragon.predict(player, dragonData, id, dragon.id);
      });

    const habitatUtil = new HabitatUtility(habitat);
    const { lastOnline } = this.data.get<TimeInfo>(player, "timeInfo");
    const perMinuteGold = habitatUtil.calculateTotalGoldPerMinute(player);
    const secondsOffline = lastOnline ? now() - lastOnline : 0;
    const minutesOffline = secondsOffline / 60;
    const gainedGold = floor(perMinuteGold * minutesOffline);
    this.habitats.addGold(player, id, gainedGold);
  }
}
import { OnStart, Service } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { StrictMap } from "@rbxts/strict-map";
import StringUtils from "@rbxts/string-utils";

import { DataService } from "../data-service";
import { SchedulingService } from "../scheduling-service";

import { Habitat } from "shared/data-models/buildings";
import { MissingDataException } from "shared/exceptions";
import { getTotalGoldPerMinute } from "shared/util";
import { OnPlayerJoin } from "server/hooks";
import { Events, Functions } from "server/network";

const { claimHabitatGold } = Events;
const { isTimerActive } = Functions;
const { ceil } = math;

interface HabitatGoldInfo {
  goldPerMinute: number;
  totalGold: number;
}

@Service()
export class HabitatService implements OnPlayerJoin, OnStart {
  // Habitat ID to Gold/Minute
  private readonly playerMap = new StrictMap<Player, Map<string, HabitatGoldInfo>>();

  public constructor(
    private readonly data: DataService,
    private readonly schedule: SchedulingService
  ) { }

  // TODO: remove ID from map if habitat is sold

  public onStart(): void {
    claimHabitatGold.connect((player, habitatID) => this.claimGold(player, habitatID));
  }

  public onPlayerJoin(player: Player): void {
    this.playerMap.set(player, new Map<string, HabitatGoldInfo>)
    this.schedule.every.second.Connect(() => {
      const habitats = <HabitatModel[]>World.Buildings.GetChildren()
        .filter(i => StringUtils.endsWith(i.Name, "Habitat"));

      for (const habitatModel of habitats) {
        if (habitatModel.Dragons.GetChildren().size() < 1) return;
        this.generateGold(player, habitatModel.GetAttribute<string>("ID"));
      }
    });
  }

  public addGold(player: Player, habitatID: string, amount: number): void {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    habitat.gold += amount;
    this.data.removeBuildingData(player, habitatID);
    this.data.addBuildingData(player, habitat);
    this.setTotalGold(player, habitatID, habitat.gold);
    this.updateGold(player, habitatID);
  }

  public updateGoldGeneration(player: Player, habitat: Habitat): void {
    const goldPerMinute = getTotalGoldPerMinute(habitat);
    const goldInfoMap = this.playerMap.mustGet(player);
    goldInfoMap.set(habitat.id, {
      goldPerMinute,
      totalGold: goldInfoMap.get(habitat.id)?.totalGold ?? habitat.gold
    });

    this.playerMap.set(player, goldInfoMap);
  }

  private claimGold(player: Player, habitatID: string): void {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    this.data.increment(player, "gold", habitat.gold);
    this.setTotalGold(player, habitatID, 0);
    this.updateGold(player, habitatID);
  }

  private setTotalGold(player: Player, habitatID: string, gold: number) {
    const goldInfoMap = this.playerMap.mustGet(player);
    const goldInfo = goldInfoMap.get(habitatID) ?? {
      goldPerMinute: 0,
      totalGold: gold
    };

    goldInfo.totalGold = gold;
    goldInfoMap.set(habitatID, goldInfo);
  }

  private updateGold(player: Player, habitatID: string): void {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    const goldInfo = this.playerMap.mustGet(player).get(habitatID)!;
    habitat.gold = goldInfo.totalGold;
    this.data.removeBuildingData(player, habitatID);
    this.data.addBuildingData(player, habitat);
    this.updateGoldGeneration(player, habitat);
  }

  // call every second
  private async generateGold(player: Player, habitatID: string): Promise<void> {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    if (await isTimerActive.predict(player, habitatID)) return;
    this.updateGold(player, habitatID);

    const goldInfoMap = this.playerMap.mustGet(player);
    const goldInfo = goldInfoMap.get(habitatID)!;
    const goldPerSecond = goldInfo.goldPerMinute / 60;
    this.setTotalGold(player, habitatID, goldInfo.totalGold + ceil(goldPerSecond));
  }
}
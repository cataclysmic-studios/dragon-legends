import { OnStart, Service } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import StringUtils from "@rbxts/string-utils";

import { DataService } from "../data-service";
import { SchedulingService } from "../scheduling-service";

import { Habitat } from "shared/data-models/buildings";
import { MissingDataException } from "shared/exceptions";
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
  private readonly playerMap = new Map<Player, Map<string, HabitatGoldInfo>>();

  public constructor(
    private readonly data: DataService,
    private readonly schedule: SchedulingService
  ) {}

  // TODO: remove ID from map if habitat is sold

  public onStart(): void {
    claimHabitatGold.connect((player, habitatID) => this.claimGold(player, habitatID));
  }

  public onPlayerJoin(player: Player): void {
    this.schedule.every.second.Connect(() => {
      const habitats = <HabitatModel[]>World.Buildings.GetChildren()
        .filter(i => StringUtils.endsWith(i.Name, "Habitat"));

      for (const habitatModel of habitats) {
        if (habitatModel.Dragons.GetChildren().size() < 1) return;
        this.generateGold(player, habitatModel.GetAttribute<string>("ID"));
      }
    });
  }

  public claimGold(player: Player, habitatID: string): void {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    this.data.increment(player, "gold", habitat.gold);

    const goldInfo = this.playerMap.get(player)!.get(habitatID)!;
    goldInfo.totalGold = 0;
    this.updateHabitatGold(player, habitatID);
  }

  public updateGoldGeneration(player: Player, habitat: Habitat): void {
    const goldPerMinute = habitat.dragons.size() > 0 ?
      habitat.dragons
        .map(d => d.goldGenerationRate)
        .reduce((accum, cur) => accum + cur)
      : 0;

    const goldInfoMap = this.playerMap.get(player) ?? new Map<string, HabitatGoldInfo>();
    goldInfoMap.set(habitat.id, {
      goldPerMinute,
      totalGold: goldInfoMap.get(habitat.id)?.totalGold ?? habitat.gold
    });

    this.playerMap.set(player, goldInfoMap);
  }

  private updateHabitatGold(player: Player, habitatID: string): void {
    const habitat = this.data.getBuildingData<Habitat>(player, habitatID);
    if (!habitat)
      throw new MissingDataException(habitatID, "Missing habitat building data");

    const goldInfo = this.playerMap.get(player)!.get(habitatID)!;
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
    this.updateHabitatGold(player, habitatID);

    const goldInfoMap = this.playerMap.get(player)!;
    const goldInfo = goldInfoMap.get(habitatID)!;
    const goldPerSecond = goldInfo.goldPerMinute / 60;
    goldInfo.totalGold += ceil(goldPerSecond);
    goldInfoMap.set(habitat.id, goldInfo)
    this.playerMap.set(player, goldInfoMap);
  }
}
import { Service, OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { PlayerDataService } from "./player-data-service";
import { BuildingLoaderService } from "../building-loader-service";

import { Timer } from "server/components/timer";
import { TimeInfo, TimerInfo, TimerType } from "shared/data-models/time";
import { Exception, MissingBuildingException } from "shared/exceptions";
import { getPlacedBuilding, now } from "shared/data-utilities/helpers";
import { Events, Functions } from "server/network";
import Log from "shared/logger";

const { updateTimers, timerFinished } = Events;
const { isTimerActive } = Functions;

@Service()
export class TimerService implements OnInit {
  public constructor(
    private readonly data: PlayerDataService,
    private readonly buildingLoader: BuildingLoaderService,
    private readonly components: Components
  ) { }

  public onInit(): void {
    updateTimers.connect((player) => this.updateTimers(player))
    isTimerActive.setCallback((player, id) => this.isTimerActive(player, id));
    this.buildingLoader.onBuildingsLoaded
      .Connect((player) => this.updateTimers(player));
  }

  public addHatchTimer(player: Player, eggID: string, length: number): void {
    this.addTimerData(player, {
      id: eggID,
      type: TimerType.Hatch,
      beganAt: now(),
      length
    });
    this.updateTimers(player);
  }

  public addBuildingTimer(player: Player, id: string, length: number): void {
    this.addTimerData(player, {
      id,
      type: TimerType.Building,
      beganAt: now(),
      length
    });
    this.updateTimers(player);
  }

  private removeTimerData(player: Player, id: string): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    timeInfo.timers = timeInfo.timers.filter(timer => timer.id !== id);
    this.data.set(player, "timeInfo", timeInfo);
  }

  private addTimerData(player: Player, timer: TimerInfo): void {
    Log.info(`Added new ${timer.type} timer (ID ${timer.id})`);
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    timeInfo.timers = [...timeInfo.timers, timer];
    this.data.set(player, "timeInfo", timeInfo);
  }

  private isTimerActive(player: Player, buildingID: string): boolean {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    return timers.find(timer => timer.id === buildingID) !== undefined;
  }

  private async updateTimers(player: Player): Promise<void> {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    for (const timer of timers)
      task.spawn(() => {
        const modelForTimer = this.getModelForTimer(timer);
        const completionTime = timer.beganAt + timer.length;

        if (now() >= completionTime) {
          timerFinished(player, timer);
          this.removeTimerData(player, timer.id);
          if (this.components.getComponent<Timer>(modelForTimer))
            this.components.removeComponent<Timer>(modelForTimer);
        } else
          if (!this.components.getComponent<Timer>(modelForTimer))
            this.components.addComponent<Timer>(modelForTimer);
      });
  }

  private getModelForTimer(timer: TimerInfo): Model | MeshPart {
    switch (timer.type) {
      case TimerType.Building: {
        const building = getPlacedBuilding(timer.id);
        if (!building)
          throw new MissingBuildingException(timer.id, "Could not find building associated with timer");

        return building;
      }
      case TimerType.Hatch: {
        const building = getPlacedBuilding<HatcheryModel>("HATCHERY");
        const eggMesh = <Maybe<MeshPart>>building.Eggs.GetChildren()
          .find(e => e.GetAttribute<string>("ID") === timer.id);

        if (!eggMesh)
          throw new Exception("MissingEgg", `Could not find egg associated with timer | Egg ID ${timer.id}`);

        return eggMesh;
      }
    }
  }
}
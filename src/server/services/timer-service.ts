import { Service, OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { DataService } from "./data-service";
import { BuildingLoaderService } from "./building-loader-service";

import { Timer } from "server/components/timer";
import { TimeInfo, TimerInfo, TimerType } from "shared/data-models/time";
import { Exception, MissingBuildingException } from "shared/exceptions";
import { getBuildingModel, now } from "shared/util";
import { Events, Functions } from "server/network";

const { updateTimers } = Events;
const { isTimerActive } = Functions;

@Service()
export class TimerService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly buildingLoader: BuildingLoaderService,
    private readonly components: Components
  ) {}

  public onInit(): void {
    updateTimers.connect((player) => this.updateTimers(player))
    isTimerActive.setCallback((player, id) => this.isTimerActive(player, id));
    this.buildingLoader.onBuildingsLoaded
      .Connect((player) => this.updateTimers(player));
  }

  public addHatchTimer(player: Player, eggID: string, length: number): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    const timer: TimerInfo = {
      id: eggID,
      type: TimerType.Hatch,
      beganAt: now(),
      length
    };

    timeInfo.timers = [ ...timeInfo.timers, timer ];
    this.data.set(player, "timeInfo", timeInfo);
    this.updateTimers(player);
  }

  public addBuildingTimer(player: Player, id: string, length: number): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    const timer: TimerInfo = {
      id,
      type: TimerType.Building,
      beganAt: now(),
      length
    };

    timeInfo.timers = [ ...timeInfo.timers, timer ];
    this.data.set(player, "timeInfo", timeInfo);
    this.updateTimers(player);
  }

  public removeTimer(player: Player, id: string): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    timeInfo.timers = timeInfo.timers.filter(timer => timer.id !== id);
    this.data.set(player, "timeInfo", timeInfo);
  }

  public isTimerActive(player: Player, buildingID: string): boolean {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    return timers.find(timer => timer.id === buildingID) !== undefined;
  }

  private async updateTimers(player: Player): Promise<void> {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    for (const timer of timers) {
      const modelForTimer = this.getModelForTimer(timer);
      const completionTime = timer.beganAt + timer.length;

      if (now() >= completionTime) {
        this.removeTimer(player, timer.id);
        if (this.components.getComponent<Timer>(modelForTimer))
          this.components.removeComponent<Timer>(modelForTimer);
      } else
        if (!this.components.getComponent<Timer>(modelForTimer))
          this.components.addComponent<Timer>(modelForTimer);
    }
  }

  private getModelForTimer(timer: TimerInfo): Model | MeshPart {
    switch (timer.type) {
      case TimerType.Building: {
        const building = getBuildingModel(timer.id);
        if (!building)
          throw new MissingBuildingException(timer.id, "Could not find building associated with timer");

        return building;
      }
      case TimerType.Hatch: {
        const building = getBuildingModel<HatcheryModel>("HATCHERY");
        const eggMesh = <Maybe<MeshPart>>building.Eggs.GetChildren()
          .find(e => e.GetAttribute<string>("ID") === timer.id);

        if (!eggMesh)
          throw new Exception("MissingEgg", `Could not find egg associated with timer | Egg ID ${timer.id}`);

        return eggMesh;
      }
    }
  }
}
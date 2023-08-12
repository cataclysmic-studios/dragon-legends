import { Service, OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { DataService } from "./data-service";
import { BuildingLoaderService } from "./building-loader-service";
import { Timer } from "server/components/timer";
import { BuildingTimer, TimeInfo } from "shared/data-models";
import { now } from "shared/util";
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

  public isTimerActive(player: Player, buildingID: string): boolean {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    return timers.find(timer => timer.buildingID === buildingID) !== undefined;
  }

  private async updateTimers(player: Player): Promise<void> {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    for (const timer of timers) {
      const building = World.Buildings.GetChildren()
        .find((building): building is Model => building.GetAttribute<string>("ID") === timer.buildingID);

      if (!building)
        return warn("Could not find building associated with timer. ID " + timer.buildingID);

      const completionTime = timer.beganAt + timer.length;
      if (now() >= completionTime) {
        this.removeTimer(player, timer.buildingID);
        if (this.components.getComponent<Timer>(building))
          this.components.removeComponent<Timer>(building);
      } else
        if (!this.components.getComponent<Timer>(building))
          this.components.addComponent<Timer>(building);
    }
  }

  public removeTimer(player: Player, id: string): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    timeInfo.timers = timeInfo.timers.filter(timer => timer.buildingID !== id);
    this.data.set(player, "timeInfo", timeInfo);
  }

  public addBuildingTimer(player: Player, id: string, length: number): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    const timer: BuildingTimer = {
      buildingID: id,
      beganAt: now(),
      length
    };

    timeInfo.timers = [ ...timeInfo.timers, timer ];
    this.data.set(player, "timeInfo", timeInfo);
    this.updateTimers(player);
  }
}
import { Service, Dependency, OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { BuildingTimer, TimeInfo, Timer } from "shared/data-models";
import { DataService } from "./data-service";
import { BuildingLoaderService } from "./building-loader-service";

@Service()
export class TimerService implements OnInit {
  private readonly data = Dependency<DataService>();
  private readonly buildingLoader = Dependency<BuildingLoaderService>();

  public onInit(): void {
    this.buildingLoader.onBuildingsLoaded.Connect((player) => this.updateTimers(player));
  }

  private async updateTimers(player: Player): Promise<void> {
    const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
    for (const timer of timers) {
      const building = World.Buildings.GetChildren()
        .find((building): building is Model => building.GetAttribute<string>("ID") === timer.buildingID);

      if (!building)
        return warn("Could not find building associated with timer. ID " + timer.buildingID);

      const components = Dependency<Components>();
      if (timer.beganAt + timer.length < tick())
        components.addComponent<Timer>(building);
      else
        if (components.getComponent<Timer>(building))
          components.removeComponent<Timer>(building);
    }
  }

  public addBuildingTimer(player: Player, id: string, length: number): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    const timer: BuildingTimer = {
      buildingID: id,
      beganAt: tick(),
      length
    };

    timeInfo.timers.push(timer);
    this.data.set(player, "timeInfo", timeInfo);
  }
}
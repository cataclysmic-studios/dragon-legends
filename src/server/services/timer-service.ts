import { Service, OnInit, Dependency } from "@flamework/core";
import { TimeInfo } from "shared/data-models";
import { DataService } from "./data-service";

@Service()
export class TimerService implements OnInit {
  private readonly data = Dependency<DataService>();
  
  public onInit(): void {
    
  }

  public addBuildingTimer(player: Player, id: string): void {
    const timeInfo = this.data.get<TimeInfo>(player, "timeInfo");
    timeInfo.timers.push({
      buildingID: id,
      beganAt: tick()
    });

    // need timer component or something to display remaining time
    this.data.set(player, "timeInfo", timeInfo);
  }
}
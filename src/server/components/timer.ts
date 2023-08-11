import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Players } from "@rbxts/services";
import { TimeInfo } from "shared/data-models";
import { Assets, toRemainingTime, now } from "shared/util";

import { SchedulingService } from "server/services/scheduling-service";
import { DataService } from "server/services/data-service";
import { Events } from "server/network";

interface Attributes {
  ID: string;
}

@Component({ tag: "Timer" })
export class Timer extends BaseComponent<Attributes, Model> implements OnStart {
  private readonly data = Dependency<DataService>();
  private readonly scheduler = Dependency<SchedulingService>();

  public onStart(): void {
    const timerUI = Assets.UI.Timer.Clone();
    timerUI.Adornee = this.instance;
    timerUI.Parent = this.instance;
    
    const updateTimer = () => {
      const [ player ] = <Player[]>Players.GetChildren();
      if (!player) return;

      const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
      const timer = timers.find(timer => timer.buildingID === this.attributes.ID);
      if (!timer)
        return warn("Could not find timer associated with building ID " + this.attributes.ID);

      const timeElapsed = now() - timer.beganAt;
      const timeRemaining = timer.length - timeElapsed;
      if (timeRemaining <= 0)
        return Events.updateTimers.predict(player); // TODO: completion prompt, reward XP & such

      timerUI.RemainingTime.Text = toRemainingTime(timeRemaining);
    };

    updateTimer();
    this.maid.GiveTask(timerUI);
    this.maid.GiveTask(this.scheduler.every.second.Connect(updateTimer));
  }
}
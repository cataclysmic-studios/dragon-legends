import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Players } from "@rbxts/services";

import { SchedulingService } from "server/services/scheduling-service";
import { DataService } from "server/services/data-service";
import { TimeInfo } from "shared/data-models";
import { Assets, toRemainingTime, now } from "shared/util";
import { Exception } from "shared/exceptions";
import { Events } from "server/network";

const { updateTimers } = Events;

interface Attributes {
  ID: string;
}

@Component({ tag: "Timer" })
export class Timer extends BaseComponent<Attributes, Model | MeshPart> implements OnStart {
  public constructor(
    private readonly data: DataService,
    private readonly schedule: SchedulingService
  ) { super(); }

  public onStart(): void {
    const timerUI = Assets.UI.Timer.Clone();
    timerUI.Adornee = this.instance;
    timerUI.Parent = this.instance;
    
    const updateUI = () => {
      const [ player ] = <Player[]>Players.GetChildren();
      if (!player) return;

      const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
      const timer = timers.find(timer => timer.id === this.attributes.ID);
      if (!timer)
        throw new Exception("MissingTimer", `Could not find timer associated with "${this.instance.Name}" (ID ${this.attributes.ID})`);

      if (!timerUI.FindFirstChildOfClass("ImageLabel")) {
        const icon = <ImageLabel>Assets.UI.TimerIcons.WaitForChild(timer.type);
        icon.Parent = timerUI;
      }

      const timeElapsed = now() - timer.beganAt;
      const timeRemaining = timer.length - timeElapsed;
      if (timeRemaining <= 0)
        return updateTimers.predict(player); // TODO: completion prompt, reward XP & such

      timerUI.RemainingTime.Text = toRemainingTime(timeRemaining);
    };

    updateUI();
    this.maid.GiveTask(timerUI);
    this.maid.GiveTask(this.schedule.every.second.Connect(updateUI));
  }

  private addIcon(): void {
    
  }
}
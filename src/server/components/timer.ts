import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Players } from "@rbxts/services";

import { SchedulingService } from "server/services/scheduling-service";
import { PlayerDataService } from "server/services/data-management/player-data-service";
import { LevelService } from "server/services/data-management/level-service";

import { Assets, toRemainingTime, now } from "shared/utilities/helpers";
import { TimeInfo, TimerInfo } from "shared/data-models/time";
import { Exception } from "shared/exceptions";
import { Events } from "server/network";

const { updateTimers } = Events;

interface Attributes {
  ID: string;
}

@Component({ tag: "Timer" })
export class Timer extends BaseComponent<Attributes, Model | MeshPart> implements OnStart {
  public constructor(
    private readonly data: PlayerDataService,
    private readonly levels: LevelService,
    private readonly schedule: SchedulingService
  ) { super(); }

  public onStart(): void {
    const timerUI = Assets.UI.Timer.Clone();
    timerUI.Adornee = this.instance;
    timerUI.Parent = this.instance;

    const updateUI = () => {
      const [player] = Players.GetPlayers();
      if (!player) return;

      const { timers } = this.data.get<TimeInfo>(player, "timeInfo");
      const timer = timers.find(timer => timer.id === this.attributes.ID);
      if (!timer)
        throw new Exception("MissingTimer", `Could not find timer associated with "${this.instance.Name}" (ID ${this.attributes.ID})`);

      this.addIcon(timer, timerUI);
      const timeElapsed = now() - timer.beganAt;
      const timeRemaining = timer.length - timeElapsed;
      if (timeRemaining <= 0) {
        if (this.instance.IsA("Model")) {
          const xpClaimUI = Assets.UI.ClaimXP.Clone();
          xpClaimUI.Button.MouseButton1Click.Once(() => {
            const rewardXP = this.instance.GetAttribute<number>("RewardXP");
            this.levels.addXP(player, rewardXP);
            xpClaimUI.Enabled = false;
          });

          xpClaimUI.Adornee = this.instance;
          xpClaimUI.Enabled = true;
          xpClaimUI.Parent = player.WaitForChild("PlayerGui");
        }
        return updateTimers.predict(player);
      }

      timerUI.RemainingTime.Text = toRemainingTime(timeRemaining);
    };

    updateUI();
    this.maid.GiveTask(timerUI);
    this.maid.GiveTask(this.schedule.every.second.Connect(updateUI));
  }

  private addIcon(timer: TimerInfo, timerUI: BillboardGui): void {
    if (timerUI.FindFirstChildOfClass("ImageLabel")) return;
    const icon = <ImageLabel>Assets.UI.TimerIcons.WaitForChild(timer.type).Clone();
    icon.Parent = timerUI;
  }
}

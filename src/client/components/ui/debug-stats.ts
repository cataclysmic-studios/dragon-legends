import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { RunService as Runtime, Stats } from "@rbxts/services";
import { toSuffixedNumber } from "shared/util";
import Log from "shared/logger";

const { floor } = math;

interface DebugScreen extends ScreenGui {
  Stats: Frame & {
    MemoryUsage: TextLabel;
    Incoming: TextLabel;
    Outgoing: TextLabel;
    Instances: TextLabel;
  };
}

@Component({ tag: "DebugStats" })
export class DebugStats extends BaseComponent<{}, DebugScreen> implements OnStart {
  private active = true;

  public onStart(): void {
    Log.info("Displaying debug stats");

    this.instance.Enabled = Runtime.IsStudio();
    this.maid.GiveTask(() => this.active = false);
    task.spawn(() => {
      while (this.active) {
        this.update();
        task.wait(0.5);
      }
    });
  }

  public update(): void {
    const stats = this.instance.Stats;
    stats.MemoryUsage.Text = `MemoryUsage: ${toSuffixedNumber(floor(Stats.GetTotalMemoryUsageMb()))} MB`;
    stats.Incoming.Text = `NetworkIncoming: ${floor(Stats.DataReceiveKbps)} kb/s`;
    stats.Outgoing.Text = `NetworkOutgoing: ${floor(Stats.DataSendKbps)} kb/s`;
    stats.Instances.Text = "Instances: " + toSuffixedNumber(Stats.InstanceCount);
  }
}
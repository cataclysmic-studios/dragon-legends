import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { RunService as Runtime, Stats } from "@rbxts/services";
import Object from "@rbxts/object-utils";

import { SelectionController } from "client/controllers/selection-controller";
import { toSuffixedNumber } from "shared/util";
import repr from "shared/repr";
import Log from "shared/logger";

const { floor } = math;

interface DebugScreen extends ScreenGui {
  Info: Frame;
  Stats: Frame & {
    MemoryUsage: TextLabel;
    Incoming: TextLabel;
    Outgoing: TextLabel;
    Instances: TextLabel;
    ViewInfo: TextButton;
  };
}

@Component({ tag: "DebugStats" })
export class DebugStats extends BaseComponent<{}, DebugScreen> implements OnStart {
  private active = true;

  public constructor(
    private readonly selection: SelectionController
  ) { super(); }

  public onStart(): void {
    Log.info("Displaying debug stats");

    this.instance.Enabled = Runtime.IsStudio();
    this.maid.GiveTask(() => this.active = false);
    this.maid.GiveTask(this.instance.Stats.ViewInfo.MouseButton1Click.Connect(async () => {
      const selectedBuilding = await this.selection.getSelectedBuilding();
      if (!selectedBuilding) return;
      if (this.instance.Info.Visible)
        return this.instance.Info.Visible = false;

      this.instance.Info.Visible = true;
    }));

    this.maid.GiveTask(this.selection.onSelectionChanged.Connect(async () => {
      const selectedBuilding = await this.selection.getSelectedBuilding();
      this.instance.Stats.ViewInfo.Visible = selectedBuilding !== undefined;
      if (this.instance.Info.Visible && !selectedBuilding)
        this.instance.Info.Visible = false;

      if (!selectedBuilding) return;
      this.updateInfoFrame(selectedBuilding);
    }));

    task.spawn(() => {
      while (this.active) {
        this.updateStatsFrame();
        task.wait(0.5);
      }
    });
  }

  private updateInfoFrame(info: Record<string, unknown>): void {
    const infoLabels = this.instance.Info.GetChildren()
      .filter(i => i.IsA("TextLabel"));

    for (const label of infoLabels)
      label.Destroy();

    let order = 1;
    for (const [key, value] of Object.entries(info)) {
      const property = new Instance("TextLabel");
      property.BackgroundTransparency = 1;
      property.Name = "PropertyLabel";
      property.RichText = true;
      property.TextScaled = true;
      property.FontFace = new Font("rbxasset://fonts/families/Ubuntu.json", Enum.FontWeight.Medium, Enum.FontStyle.Normal);
      property.Size = UDim2.fromScale(1, 0.05);
      property.TextColor3 = Color3.fromRGB(188, 226, 255);
      property.TextXAlignment = Enum.TextXAlignment.Left;

      const color = this.getTypeColor(value);
      const valueText = this.color(this.getPrettyValue(value), color);
      property.Text = key + ": " + valueText;
      property.LayoutOrder = order;
      property.Parent = this.instance.Info;

      order++;
    }
  }

  private color(text: string, color: Maybe<string>): string {
    return color ? `<font color="#${color}">${text}</font>` : text;
  }

  private getPrettyValue(value: defined): string {
    if (typeOf(value) === "table") {
      const contents = Object.entries(<Record<string | number, unknown>>value)
        .map(([k, v]) => {
          const keyColor = this.getTypeColor(k);
          const valueColor = this.getTypeColor(v);
          return `${this.color(this.getPrettyValue(k), keyColor)} = ${this.color(this.getPrettyValue(v), valueColor)}`;
        })
        .join(", ");

      return `{${contents}}`;
    }

    return repr(value, { sortKeys: true });
  }

  private updateStatsFrame(): void {
    const stats = this.instance.Stats;
    stats.MemoryUsage.Text = `MemoryUsage: ${toSuffixedNumber(floor(Stats.GetTotalMemoryUsageMb()))} MB`;
    stats.Incoming.Text = `NetworkIncoming: ${floor(Stats.DataReceiveKbps)} kb/s`;
    stats.Outgoing.Text = `NetworkOutgoing: ${floor(Stats.DataSendKbps)} kb/s`;
    stats.Instances.Text = "Instances: " + toSuffixedNumber(Stats.InstanceCount);
  }

  private getTypeColor(value: unknown): Maybe<string> {
    switch (typeOf(value)) {
      case "EnumItem":
        return "00aaff";
      case "string":
        return "55ff7f";
      case "number":
        return "ff5500";
      case "boolean":
        return "fff04a";
      case "nil":
        return "db5433";
    }
  }
}
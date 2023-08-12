import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Building, DataKey } from "shared/data-models";
import { Events, Functions } from "client/network";

const { dataUpdate } = Events;
const { findBuilding } = Functions;

interface Attributes {}

@Component({ tag: "BuildingTitle" })
export class BuildingTitle extends BaseComponent<Attributes, TextLabel> implements OnStart {

  private readonly buildingSelectFrame = this.instance.Parent!;

  public onStart(): void {
    this.maid.GiveTask(dataUpdate.connect((key) => this.onDataUpdate(key)));
    this.maid.GiveTask(
      this.buildingSelectFrame
        .GetAttributeChangedSignal("ID")
        .Connect(() => this.updateTitle())
    );
  }

  private onDataUpdate(key: DataKey): void {
    if (key !== "buildings") return;
    this.updateTitle()
  }

  private async updateTitle(): Promise<void> {
    const building = await this.getBuilding();
    if (!building) return;

    const level = "level" in building ? <number>building.level : undefined;
    this.instance.Text = building.name + " " + (level ? `(level ${level})` : "");
  }

  private async getBuilding(): Promise<Maybe<Building>> {
    const id = this.buildingSelectFrame.GetAttribute<string>("ID");
    return findBuilding(id);
  }
}
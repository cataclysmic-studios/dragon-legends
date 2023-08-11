import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { BuildingInfo, HabitatInfo, DataKey, DataValue } from "shared/data-models";
import { suffixedNumber } from "shared/util";
import { Events, Functions } from "client/network";

interface Attributes {}

@Component({ tag: "HabitatGold" })
export class HabitatGold extends BaseComponent<Attributes, TextLabel> implements OnStart {
  private readonly buildingSelectFrame = this.instance.Parent?.Parent?.Parent!;

  public onStart(): void {
    this.maid.GiveTask(Events.dataUpdate.connect((key, value) => this.onDataUpdate(key, value)));
    this.maid.GiveTask(
      this.buildingSelectFrame
        .GetAttributeChangedSignal("ID")
        .Connect(async () => {
          const buildings = <BuildingInfo[]>await Functions.getData("buildings");
          this.updateGoldText(buildings);
        })
    );
  }

  private onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== "buildings") return;
    this.updateGoldText(<BuildingInfo[]>value);
  }

  private updateGoldText(buildings: BuildingInfo[]): void {
    const habitat = this.getHabitat(buildings);
    if (!habitat) return;
    this.instance.Text = suffixedNumber(habitat.gold);
  }

  private getHabitat(buildings: BuildingInfo[]): Maybe<HabitatInfo> {
    const id = this.buildingSelectFrame.GetAttribute<string>("ID");

    return buildings
      .filter((building): building is HabitatInfo => "dragons" in building)
      .find(building => building.id === id);
  }
}
import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Events } from "client/network";
import { BuildingInfo, HabitatInfo, DataKey, DataValue } from "shared/data-models";
import { suffixedNumber } from "shared/util";

interface Attributes {}

@Component({ tag: "HabitatGold" })
export class HabitatGold extends BaseComponent<Attributes, TextLabel> implements OnStart {
  public onStart(): void {
    this.instance.Text = "0";
    Events.dataUpdate.connect((key, value) => this.onDataUpdate(key, value))
  }

  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== "buildings") return;

    const buildings = <BuildingInfo[]>value;
    const buildingSelectFrame = this.instance.Parent?.Parent?.Parent;
    const id = buildingSelectFrame?.GetAttribute<string>("ID");
    const habitat = buildings
      .filter((building): building is HabitatInfo => "gold" in building)
      .find(building => building.id === id);

    if (!habitat) return;
    this.instance.Text = suffixedNumber(habitat.gold);
  }
}
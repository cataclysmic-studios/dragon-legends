import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Building, Habitat, DataKey, DataValue } from "shared/data-models";
import { toSuffixedNumber } from "shared/util";
import { Events, Functions } from "client/network";

const { dataUpdate } = Events;
const { getData } = Functions;

interface Attributes {}

@Component({ tag: "HabitatGold" })
export class HabitatGold extends BaseComponent<Attributes, TextLabel> implements OnStart {
  private readonly buildingSelectFrame = this.instance.Parent?.Parent?.Parent!;

  public onStart(): void {
    this.maid.GiveTask(dataUpdate.connect((key, value) => this.onDataUpdate(key, value)));
    this.maid.GiveTask(
      this.buildingSelectFrame
        .GetAttributeChangedSignal("ID")
        .Connect(async () => {
          const buildings = <Building[]>await getData("buildings");
          this.updateGoldText(buildings);
        })
    );
  }

  private onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== "buildings") return;
    this.updateGoldText(<Building[]>value);
  }

  private updateGoldText(buildings: Building[]): void {
    const habitat = this.getHabitat(buildings);
    if (!habitat) return;
    this.instance.Text = toSuffixedNumber(habitat.gold);
  }

  private getHabitat(buildings: Building[]): Maybe<Habitat> {
    const id = this.buildingSelectFrame.GetAttribute<string>("ID");

    return buildings
      .filter((building): building is Habitat => "dragons" in building)
      .find(building => building.id === id);
  }
}
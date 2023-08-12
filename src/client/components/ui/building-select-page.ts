import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Building, Buildings, DataKey, Habitat } from "shared/data-models";
import { Events, Functions } from "client/network";
import { toSuffixedNumber } from "shared/util";

const { dataUpdate } = Events;
const { findBuilding } = Functions;
const { isUpgradable, isHabitat } = Buildings;

interface Attributes {
  ID?: string;
}

interface BuildingSelectFrame extends Frame {
  BuildingTitle: TextLabel;
  BottomLeft: Frame & {
    Dragon: ImageButton;
  };
  BottomRight: Frame & {
    Info: ImageButton;
    Move: ImageButton;
    Upgrade: ImageButton;
    CollectGold: ImageButton & {
      Amount: TextLabel;
    };
  };
}

@Component({ tag: "BuildingSelectPage" })
export class BuildingSelectPage extends BaseComponent<Attributes, BuildingSelectFrame> implements OnStart {
  public onStart(): void {
    this.maid.GiveTask(dataUpdate.connect((key) => this.onUpdate(key)));
    this.maid.GiveTask(
      this.instance.GetAttributeChangedSignal("ID")
        .Connect(() => this.onUpdate("buildings"))
    );
  }

  private async onUpdate(key: DataKey): Promise<void> {
    if (key !== "buildings") return;
    const building = await this.getBuilding();

    if (!building) return;
    this.updateTitle(building);
    this.updateButtons(building);
    if (isHabitat(building))
      this.updateGoldText(building);
  }

  private updateGoldText(habitat: Habitat): void {
    this.instance.BottomRight.CollectGold.Amount.Text = toSuffixedNumber(habitat.gold);
  }

  private updateButtons(building: Building) {
    this.instance.BottomRight.CollectGold.Visible = isHabitat(building);
    this.instance.BottomRight.Upgrade.Visible = isUpgradable(building);
  }

  private updateTitle(building: Building): void {
    const level = isUpgradable(building) ? building.level : undefined;
    this.instance.BuildingTitle.Text = building.name + (level ? ` (level ${level})` : "");
  }

  private async getBuilding(): Promise<Maybe<Building>> {
    return findBuilding(this.attributes.ID!);
  }
}
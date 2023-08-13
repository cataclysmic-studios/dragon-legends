import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Building, Buildings, DataKey, Habitat } from "shared/data-models";
import { DataLinked } from "client/hooks";
import { MissingBuildingException } from "shared/exceptions";
import { toSuffixedNumber } from "shared/util";
import { Functions } from "client/network";

const { findBuilding } = Functions;
const { isUpgradable, isHabitat, isHatchery } = Buildings;

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
export class BuildingSelectPage extends BaseComponent<Attributes, BuildingSelectFrame> implements OnStart, DataLinked {
  public onStart(): void {
    this.maid.GiveTask(
      this.instance.GetAttributeChangedSignal("ID")
        .Connect(() => this.onDataUpdate("buildings"))
    );
  }

  public async onDataUpdate(key: DataKey): Promise<void> {
    if (key !== "buildings") return;
    const building = await this.getBuilding();

    if (!building)
      throw new MissingBuildingException(this.attributes.ID!, "Failed to find building when updating BuildingSelectPage");

    this.updateTitle(building);
    this.updateButtons(building);
    if (isHabitat(building))
      this.updateGoldText(building);
    else if (isHatchery(building)) {
      // add egg buttons
    }
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
import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { DataKey } from "shared/data-models/generic";
import { Building, Buildings, Habitat, Hatchery } from "shared/data-models/buildings";
import { MissingBuildingException } from "shared/exceptions";
import { Assets, newEggMesh, toSuffixedNumber } from "shared/util";
import { DataLinked } from "client/hooks";
import { Functions } from "client/network";

const { findBuilding } = Functions;
const { isUpgradable, isHabitat, isHatchery } = Buildings;

interface Attributes {
  ID?: string;
}

interface BuildingSelectFrame extends Frame {
  BuildingTitle: TextLabel;
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
  private readonly buttons = this.instance.BottomRight;
  
  public onStart(): void {
    this.maid.GiveTask(
      this.instance.GetAttributeChangedSignal("ID")
        .Connect(() => this.onDataUpdate("buildings"))
    );
  }

  public async onDataUpdate(key: DataKey): Promise<void> {
    if (key !== "buildings") return;
    if (!this.attributes.ID) return;
    const building = await this.getBuilding();

    if (!building)
      throw new MissingBuildingException(this.attributes.ID, "Failed to find building when updating BuildingSelectPage");

    this.updateTitle(building);
    this.updateButtons(building);
  }

  private addEggButtons(hatchery: Hatchery): void {
    for (const egg of hatchery.eggs) {
      const button = Assets.UI.HatcheryEggButton.Clone();
      newEggMesh(egg, {
        parent: button.Viewport
      });

      button.Parent = this.buttons;
    }
  }

  private addDragonButtons(habitat: Habitat): void {
    this.buttons.CollectGold.Amount.Text = toSuffixedNumber(habitat.gold);
    for (const dragon of habitat.dragons) {
      const button = Assets.UI.HabitatDragonButton.Clone();
      // button.Boost
      button.DragonName.Text = dragon.name;
      button.Parent = this.buttons;
    }
  }

  private updateButtons(building: Building) {
    this.buttons.CollectGold.Visible = isHabitat(building);
    this.buttons.Upgrade.Visible = isUpgradable(building);

    this.removeExtraButtons(building);
    if (isHabitat(building))
      this.addDragonButtons(building);
    else if (isHatchery(building))
      this.addEggButtons(building);
  }

  private removeExtraButtons(building: Building): void {
    if (!isHabitat(building) && !isHatchery(building))
      for (const button of this.buttons.GetChildren())
        if (button.GetAttribute("DragonID") || button.GetAttribute("EggID"))
          button.Destroy();
  }

  private updateTitle(building: Building): void {
    const level = isUpgradable(building) ? building.level : undefined;
    this.instance.BuildingTitle.Text = building.name + (level ? ` (level ${level})` : "");
  }

  private async getBuilding(): Promise<Maybe<Building>> {
    return findBuilding(this.attributes.ID!);
  }
}
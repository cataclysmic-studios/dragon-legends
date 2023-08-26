import { OnStart } from "@flamework/core";
import { Component, BaseComponent, Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { SelectionController } from "client/controllers/selection-controller";
import { CacheController } from "client/controllers/cache-controller";

import { DataKey } from "shared/data-models/generic";
import { Building, Hatchery, UpgradableBuilding } from "shared/data-models/buildings";
import { Habitat } from "shared/data-models/habitats";
import { MissingBuildingException } from "shared/exceptions";
import { Assets, getPlacedBuilding, toSuffixedNumber } from "shared/utilities/helpers";
import { tween } from "shared/utilities/ui";
import BuildingUtility from "shared/utilities/building";
import InstanceCache from "shared/classes/instance-cache";

import { DataLinked } from "client/hooks";
import { Events, Functions } from "client/network";
import { HatcheryEggButtonComponent } from "./hatchery-egg-button";
import { HabitatDragonButtonComponent } from "./habitat-dragon-button";

const { claimHabitatGold } = Events;
const { getBuildingData } = Functions;

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
  private readonly updateJanitor = new Janitor;
  private readonly buttons = this.instance.BottomRight;

  private eggButtonCache?: InstanceCache<HatcheryEggButton>;
  private dragonButtonCache?: InstanceCache<HabitatDragonButton>;
  private dragonButtonDebounce = false;
  private eggButtonDebounce = false;

  public constructor(
    private readonly selection: SelectionController,
    private readonly caches: CacheController,
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
    this.eggButtonCache = this.caches.get(Assets.UI.HatcheryEggButton);
    this.dragonButtonCache = this.caches.get(Assets.UI.HabitatDragonButton);

    this.maid.GiveTask(
      this.selection.onSelectionChanged.Connect(async () => {
        this.updatePage();
        this.dragonButtonDebounce = false;
        this.eggButtonDebounce = false;
      })
    );
  }

  public async onDataUpdate(key: DataKey): Promise<void> {
    if (key !== "buildings") return;
    this.updatePage();
  }

  private async updatePage(): Promise<void> {
    if (!this.attributes.ID) return;

    const building = await this.getBuilding();
    if (!building)
      throw new MissingBuildingException(this.attributes.ID, "Failed to find building when updating BuildingSelectPage");

    this.updateTitle(building);
    this.updateButtons(building);
  }

  private addDragonButtons({ dragonIDs }: Habitat): Maybe<Janitor> {
    if (this.dragonButtonDebounce) return;
    this.dragonButtonDebounce = true;
    task.delay(2, () => this.dragonButtonDebounce = false);

    const janitor = new Janitor;
    for (const dragonID of dragonIDs)
      task.spawn(() => {
        const button = this.dragonButtonCache!.retrieve();
        const component = this.components.addComponent<HabitatDragonButtonComponent>(button);
        component.update(dragonID);
        janitor.Add(() => component.destroy());
        button.Parent = this.buttons;
      });

    return janitor;
  }

  private addEggButtons({ eggs }: Hatchery): Maybe<Janitor> {
    if (this.eggButtonDebounce) return;
    this.eggButtonDebounce = true;
    task.delay(1, () => this.eggButtonDebounce = false);

    const janitor = new Janitor;
    for (const egg of eggs) {
      const button = this.eggButtonCache!.retrieve();
      const component = this.components.addComponent<HatcheryEggButtonComponent>(button);
      component.update(egg);
      janitor.Add(() => component.destroy());
      button.Parent = this.buttons;
    }

    return janitor;
  }

  private updateButtons(building: Building) {
    this.updateJanitor.Cleanup();

    const buildingUtil = new BuildingUtility(building);
    this.buttons.CollectGold.Visible = buildingUtil.isHabitat();
    this.buttons.Upgrade.Visible = buildingUtil.isUpgradable();

    if (buildingUtil.isHabitat()) {
      const habitat = <Habitat>building;
      this.buttons.CollectGold.Amount.Text = toSuffixedNumber(habitat.gold);
      this.updateJanitor.Add(
        this.buttons.CollectGold.MouseButton1Click
          .Connect(() => this.collectGoldFromBuilding(habitat))
      );

      const janitor = this.addDragonButtons(habitat);
      if (!janitor) return;
      this.updateJanitor.Add(janitor);
    } else if (buildingUtil.isHatchery()) {
      const janitor = this.addEggButtons(<Hatchery>building);
      if (!janitor) return;
      this.updateJanitor.Add(janitor);
    }
  }

  private collectGoldFromBuilding(building: Habitat): void {
    if (building.gold < 1) return;

    const collectedGoldUI = Assets.UI.CollectedGold.Clone();
    const gainedGold = "+" + toSuffixedNumber(building.gold);
    const habitatModel = getPlacedBuilding<HabitatModel>(building.id);
    collectedGoldUI.Amount.Text = gainedGold;
    collectedGoldUI.Adornee = habitatModel;
    collectedGoldUI.Parent = habitatModel;

    const tweenInfo = new TweenInfoBuilder()
      .SetTime(3)
      .SetEasingStyle(Enum.EasingStyle.Sine);

    tween(collectedGoldUI.Amount, tweenInfo, { TextTransparency: 1 });
    tween(collectedGoldUI.Amount.UIStroke, tweenInfo, { Transparency: 1 });
    tween(collectedGoldUI.Icon, tweenInfo, { ImageTransparency: 1 });
    tween(collectedGoldUI, tweenInfo, { StudsOffsetWorldSpace: new Vector3(0, 5, 0) })
      .Completed.Once(() => collectedGoldUI.Destroy());

    claimHabitatGold(building.id);
  }

  private updateTitle(building: Building): void {
    const buildingUtil = new BuildingUtility(building);
    const level = buildingUtil.isUpgradable() ?
      (<UpgradableBuilding>building).level
      : undefined;

    this.instance.BuildingTitle.Text = building.name + (level ? ` (level ${level})` : "");
  }

  private async getBuilding(): Promise<Maybe<Building>> {
    return getBuildingData(this.attributes.ID!);
  }
}
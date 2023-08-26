import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { UIController } from "client/controllers/ui/ui-controller";
import { SelectionController } from "client/controllers/selection-controller";
import { DragonPlacementController } from "client/controllers/dragon-placement-controller";
import { CacheController } from "client/controllers/cache-controller";

import { DataKey } from "shared/data-models/generic";
import { Building, Hatchery, UpgradableBuilding } from "shared/data-models/buildings";
import { Habitat } from "shared/data-models/habitats";
import { Dragon } from "shared/data-models/dragons";
import { MissingBuildingException } from "shared/exceptions";
import { Assets, getPlacedBuilding, newDragonModel, newEggMesh, toSuffixedNumber } from "shared/utilities/helpers";
import { tween } from "shared/utilities/ui";
import BuildingUtility from "shared/utilities/building";
import InstanceCache from "shared/classes/instance-cache";

import { DataLinked } from "client/hooks";
import { Events, Functions } from "client/network";

const { timerFinished, removeEggFromHatchery, claimHabitatGold } = Events;
const { getBuildingData, getDragonData, isTimerActive } = Functions;

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
  private readonly janitor = new Janitor;
  private readonly buttonJanitors: Janitor[] = [];
  private readonly buttons = this.instance.BottomRight;

  private eggButtonCache?: InstanceCache<HatcheryEggButton>;
  private dragonButtonCache?: InstanceCache<HabitatDragonButton>;
  private dragonButtonDebounce = false;
  private eggButtonDebounce = false;

  public constructor(
    private readonly ui: UIController,
    private readonly selection: SelectionController,
    private readonly dragon: DragonPlacementController,
    private readonly caches: CacheController
  ) {
    super();
  }

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
      task.spawn(async () => {
        const dragon = <Dragon>await getDragonData(dragonID);
        const button = this.dragonButtonCache!.retrieve();
        newDragonModel(dragon.name, {
          parent: button.Viewport
        });

        // button.Boost
        button.DragonName.Text = dragon.name;
        button.Parent = this.buttons;
        button.SetAttribute("DragonID", dragonID);

        janitor.Add(button.MouseButton1Click.Connect(() => {
          this.ui.setScreenState("DragonInfo", { DragonID: dragonID });
          this.ui.open("DragonInfo");
        }));
      });

    return janitor;
  }

  private addEggButtons({ eggs }: Hatchery): Maybe<Janitor> {
    if (this.eggButtonDebounce) return;
    this.eggButtonDebounce = true;
    task.delay(1, () => this.eggButtonDebounce = false);

    const janitor = new Janitor;
    for (const egg of eggs)
      task.spawn(async () => {
        const button = Assets.UI.HatcheryEggButton.Clone();
        newEggMesh(egg, {
          parent: button.Viewport
        });

        let eggTimerFinished = !await isTimerActive(egg.id);
        button.Parent = this.buttons;
        button.Place.Visible = eggTimerFinished;
        button.SetAttribute("EggID", egg.id);

        janitor.Add(button.MouseButton1Click.Connect(async () => {
          if (!eggTimerFinished) return;
          const [dragonName] = egg.name.gsub(" Egg", "");
          const placed = await this.dragon.place(dragonName);
          if (placed) {
            removeEggFromHatchery(egg.id);
            this.eggButtonCache!.return(button);
          }
        }));

        janitor.Add(timerFinished.connect(timer => {
          if (timer.id !== egg.id) return;
          eggTimerFinished = true;
          button.Place.Visible = true;
        }));
      });

    return janitor;
  }

  private removeExtraButtons(): void {
    this.janitor.Cleanup();

    for (const janitor of this.buttonJanitors)
      janitor.Cleanup();

    this.buttonJanitors.clear();
    for (const button of this.buttons.GetChildren())
      task.spawn(() => {
        if (button.GetAttribute("DragonID")) {
          if (this.dragonButtonDebounce) return;
          this.dragonButtonCache!.return(<HabitatDragonButton>button);
        } else if (button.GetAttribute("EggID")) {
          if (this.eggButtonDebounce) return;
          this.eggButtonCache!.return(<HatcheryEggButton>button);
        }
      });
  }

  private updateButtons(building: Building) {
    const buildingUtil = new BuildingUtility(building);
    this.buttons.CollectGold.Visible = buildingUtil.isHabitat();
    this.buttons.Upgrade.Visible = buildingUtil.isUpgradable();

    this.removeExtraButtons();
    if (buildingUtil.isHabitat()) {
      const habitat = <Habitat>building;
      this.buttons.CollectGold.Amount.Text = toSuffixedNumber(habitat.gold);
      this.janitor.Add(
        this.buttons.CollectGold.MouseButton1Click
          .Connect(() => this.collectGoldFromBuilding(habitat))
      );

      const janitor = this.addDragonButtons(habitat);
      if (!janitor) return;
      this.buttonJanitors.push(janitor);
    } else if (buildingUtil.isHatchery()) {
      const janitor = this.addEggButtons(<Hatchery>building);
      if (!janitor) return;
      this.buttonJanitors.push(janitor);
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

    tween(
      collectedGoldUI.Amount, tweenInfo,
      { TextTransparency: 1 }
    );
    tween(
      collectedGoldUI.Amount.UIStroke, tweenInfo,
      { Transparency: 1 }
    );
    tween(
      collectedGoldUI.Icon, tweenInfo,
      { ImageTransparency: 1 }
    );
    tween(
      collectedGoldUI, tweenInfo,
      { StudsOffsetWorldSpace: new Vector3(0, 5, 0) }
    ).Completed.Once(() => collectedGoldUI.Destroy());

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
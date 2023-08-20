import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";
import { UIController } from "client/controllers/ui-controller";

import { DataValue, DataKey } from "shared/data-models/generic";
import { Dragon, DragonInfo } from "shared/data-models/dragons";
import { Assets, addElementsToFrame, getDragonData, newDragonModel, updateCombatBadgeIcon, updateRarityIcon } from "shared/utilities/helpers";
import DragonUtility from "shared/utilities/dragon";

import { DataLinked } from "client/hooks";
import { Functions } from "client/network";

const { getData } = Functions;

@Component({ tag: "DragonbookContent" })
export class Dragonbook extends BaseComponent implements DataLinked, OnStart {
  private readonly janitor = new Janitor;
  private readonly cards: DragonbookCard[] = [];
  private readonly dragonModels = Assets.Dragons.GetChildren()
    .filter((i): i is Model => i.IsA("Model"));

  public constructor(
    private readonly ui: UIController
  ) { super(); }

  public onStart(): void {
    this.updateUnownedDragons();
  }

  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== "dragons") return;

    this.janitor.Cleanup();
    this.cards.clear();

    task.spawn(() => this.updateUnownedDragons());
    for (const dragon of <Dragon[]>value) {
      let card = this.cards.find(card => card.GetAttribute<Maybe<string>>("ID") === dragon.id);
      if (!card) { // dragon is owned but card doesn't exist yet
        const dragonModels = Assets.Dragons.GetChildren()
          .filter((i): i is Model => i.IsA("Model"));

        const dragonModel = dragonModels.find(model => model.Name === dragon.name)!;
        const dragonData = getDragonData(dragonModel);
        card = this.addCard(dragonData, dragon.id);
      }

      this.updateCard(card, dragon);
    }
  }

  private async updateUnownedDragons(): Promise<void> {
    const dragons = <Dragon[]>await getData("dragons");

    for (const dragonModel of this.dragonModels) {
      const dragon = dragons.find(d => d.name === dragonModel.Name);
      if (!dragon) {
        const dragonData = getDragonData(dragonModel);
        this.addCard(dragonData);
      }
    }
  }

  private addCard(info: DragonInfo, id?: string): DragonbookCard {
    const card = Assets.UI.DragonbookCard.Clone();
    card.Title.Text = `${info.index}. ${info.name}`;

    addElementsToFrame(card.Viewport.Elements, info.elements);
    updateRarityIcon(card.Viewport.Rarity, info.rarity);
    newDragonModel(info.name, { parent: card.Viewport });
    this.setOwnedCardStyle(card, false);

    if (id)
      this.janitor.Add(card.MouseButton1Click.Connect(() => {
        this.ui.setScreenState("DragonInfo", { DragonID: id });
        this.ui.open("DragonInfo");
      }));

    card.LayoutOrder = info.index;
    card.Parent = this.instance;
    return this.janitor.Add(card);
  }

  private updateCard(card: DragonbookCard, dragon: Dragon) {
    const dragonUtil = new DragonUtility(dragon);
    card.Viewport.Level.Value.Text = tostring(dragonUtil.getLevel());
    updateCombatBadgeIcon(card.Viewport.CombatBadge, dragon.combatBadge);
    this.setOwnedCardStyle(card, true);
    card.SetAttribute("ID", dragon.id);
  }

  private setOwnedCardStyle(card: DragonbookCard, owned: boolean): void {
    card.Viewport.Level.Visible = owned;
    card.Viewport.CombatBadge.Visible = owned;
    card.BackgroundTransparency = owned ? 0 : 0.5;
  }
}
import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { PlacementController } from "client/controllers/placement-controller";
import { UIController } from "client/controllers/ui-controller";
import { Element } from "shared/data-models";
import { Assets, Placable, getDragonData, getRarityImage, toSuffixedNumber } from "shared/util";
import { Functions } from "client/network";

interface Attributes {}

@Component({ tag: "ShopContent" })
export class ShopContent extends BaseComponent<Attributes, ScrollingFrame> implements OnStart {
  private readonly placement = Dependency<PlacementController>();
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const contentType = <Placable>this.instance.Parent?.Name!;
    const items = <Model[]>Assets.FindFirstChild(contentType)!
      .GetChildren()
      .filter(i => i.IsA("Model"));

    for (const item of items) {
      const card = Assets.UI.ItemCard.Clone();
      card.Title.Text = item.Name;

      const viewportModel = item.Clone();
      viewportModel.PrimaryPart!.Position = new Vector3;
      viewportModel.Parent = card.Viewport;

      const price = <number>item.GetAttribute("Price");
      if (!price)
        return error(`Shop item "${item.Name}" is missing "Price" attribute.`)

      card.Purchase.Container.Price.Text = toSuffixedNumber(price);
      this.configureSpecifics(contentType, card, item);

      let db = false;
      card.Purchase.MouseButton1Click.Connect(async () => {
        if (db) return;
        db = true;
        task.delay(1, () => db = false);

        const gold = <number>await Functions.getData("gold");
        if (price > gold) return;
        this.onPurchaseClick(item, contentType)
        this.ui.open("Main");
      });

      card.Parent = this.instance;
      this.maid.GiveTask(card);
    }
  }

  private onPurchaseClick(item: Model, contentType: Placable): void {
    switch (contentType) {
      case "Dragons":
        // TODO: add egg to inventory
        // TODO: call this to place the dragon after hatching the egg
        // this.placement.placeDragon(item);
        break;

      default:
        this.placement.place(item.Name, contentType);
        break;
    }
  }

  private configureSpecifics(contentType: Placable, card: ItemCard, item: Model): void {
    switch (contentType) {
      case "Dragons": {
        const dragon = getDragonData(item);
        card.Rarity.Image = getRarityImage(dragon.rarity);
        card.Rarity.Abbreviation.Text = dragon.rarity.sub(1, 1);
        this.addElements(dragon.elements, card.Elements);

        card.Rarity.Visible = true;
        card.Elements.Visible = true;
        break;
      }
    }
  }

  private addElements(elements: Element[], frame: Frame): void {
    let order = 1;
    for (const element of elements) {
      const banner = <ImageLabel>Assets.UI.ElementBanners.WaitForChild(element).Clone();
      banner.LayoutOrder = order;
      banner.Parent = frame;
      order++;
    }
  }
}
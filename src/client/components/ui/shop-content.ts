import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { CollectionService as Collection, HttpService as HTTP, Workspace as World } from "@rbxts/services";
import { PlacementController } from "client/controllers/placement-controller";
import { NotificationController, NotificationType } from "client/controllers/notification-controller";
import { UIController } from "client/controllers/ui-controller";

import { Egg, InventoryItem } from "shared/data-models/inventory";
import { Element } from "shared/data-models/dragons";
import { Assets, Placable, getDragonData, getRarityImage, toSeconds, toSuffixedNumber } from "shared/util";
import { Events, Functions } from "client/network";
import { MissingAttributeException } from "shared/exceptions";

const { setData, addNotificationToButton } = Events;
const { getData } = Functions;

interface Attributes {}

@Component({ tag: "ShopContent" })
export class ShopContent extends BaseComponent<Attributes, ScrollingFrame> implements OnStart {
  public constructor(
    private readonly ui: UIController,
    private readonly notifications: NotificationController,
    private readonly placement: PlacementController
  ) { super(); }

  public onStart(): void {
    const contentType = <Placable>this.instance.Parent?.Name!;
    const items = <Model[]>Assets.FindFirstChild(contentType)!
      .GetChildren()
      .filter(i => i.IsA("Model") && !Collection.HasTag(i, "NotPurchasable"));

    for (const item of items) {
      const card = Assets.UI.ItemCard.Clone();
      card.Title.Text = item.Name;

      const viewportModel = item.Clone();
      viewportModel.PrimaryPart!.Position = new Vector3;
      viewportModel.Parent = card.Viewport;

      const price = item.GetAttribute<Maybe<number>>("Price") ?? getDragonData(item).price;
      if (!price)
        throw new MissingAttributeException(item, "Price");

      card.Purchase.Container.Price.Text = toSuffixedNumber(price);
      this.configureSpecifics(contentType, card, item);

      let db = false;
      this.maid.GiveTask(card.Purchase.MouseButton1Click.Connect(async () => {
        if (db) return;
        db = true;
        task.delay(1, () => db = false);

        const gold = <number>await getData("gold");
        if (price > gold)
          return this.notifications.dispatch(`You need ${toSuffixedNumber(price - gold)} more gold to purchase this.`, NotificationType.Error);

        this.ui.open("Main");
        this.onPurchaseClick(item, contentType, price, gold);
      }));

      card.Parent = this.instance;
      this.maid.GiveTask(card);
    }
  }

  private async onPurchaseClick(
    itemModel: Model,
    contentType: Placable,
    price: number,
    gold: number
  ): Promise<void> {

    switch (contentType) {
      case "Dragons":
        const inventory = <InventoryItem[]>await getData("inventory");
        const { hatchTime } = getDragonData(itemModel);
        const egg: Egg = {
          id: HTTP.GenerateGUID(),
          name: itemModel.Name + " Egg",
          hatchTime: toSeconds(hatchTime)
        };

        inventory.push(egg);
        setData("inventory", inventory);
        setData("gold", gold - price);

        this.notifications.dispatch("Added egg to your inventory!");
        addNotificationToButton.predict("Inventory");
        break;

      default:
        this.placement.place(itemModel.Name, contentType);
        break;
    }
  }

  private configureSpecifics(contentType: Placable, card: ItemCard, itemModel: Model): void {
    switch (contentType) {
      case "Dragons": {
        const dragon = getDragonData(itemModel);
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
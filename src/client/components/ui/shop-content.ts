import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { CollectionService as Collection, HttpService as HTTP } from "@rbxts/services";
import { BuildingPlacementController } from "client/controllers/building-placement-controller";
import { NotificationController } from "client/controllers/notification-controller";
import { NotificationType } from "shared/notification-type";
import { UIController } from "client/controllers/ui-controller";

import { Egg, InventoryItem } from "shared/data-models/inventory";
import { Assets, Placable, addElementsToFrame, getDragonData, toSeconds, toSuffixedNumber, updateRarityIcon } from "shared/utilities/helpers";
import { Events, Functions } from "client/network";
import { MissingAttributeException } from "shared/exceptions";

const { setData, incrementData, addNotificationToButton } = Events;
const { getData } = Functions;

interface Attributes { }

@Component({ tag: "ShopContent" })
export class ShopContent extends BaseComponent<Attributes, ScrollingFrame> implements OnStart {
  public constructor(
    private readonly ui: UIController,
    private readonly notification: NotificationController,
    private readonly building: BuildingPlacementController
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
          return this.notification.dispatch(`You need ${toSuffixedNumber(price - gold)} more gold to purchase this.`, NotificationType.Error);

        this.ui.open("Main");
        this.onPurchaseClick(item, contentType, price);
      }));

      card.Parent = this.instance;
      this.maid.GiveTask(card);
    }
  }

  private async onPurchaseClick(
    itemModel: Model,
    contentType: Placable,
    price: number
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
        incrementData("gold", -price);

        this.notification.dispatch("Added egg to your inventory!");
        addNotificationToButton.predict("Inventory");
        break;

      default:
        this.building.place(itemModel.Name, contentType);
        break;
    }
  }

  private configureSpecifics(contentType: Placable, card: ItemCard, itemModel: Model): void {
    switch (contentType) {
      case "Dragons": {
        const { rarity, elements } = getDragonData(itemModel);
        updateRarityIcon(card.Rarity, rarity)
        addElementsToFrame(card.Elements, elements);

        card.Rarity.Visible = true;
        card.Elements.Visible = true;
        break;
      }
    }
  }
}
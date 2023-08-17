import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";
import { NotificationController } from "client/controllers/notification-controller";

import { DataKey, DataValue } from "shared/data-models/generic";
import { InventoryItem, InventoryItems } from "shared/data-models/inventory";
import { Hatchery } from "shared/data-models/buildings";
import { NotificationType } from "shared/notification-type";
import { Assets, getPlacedBuilding, newEggMesh } from "shared/util";
import { DataLinked } from "client/hooks";
import { Events, Functions } from "client/network";

const { addEggToHatchery } = Events;
const { getBuildingData } = Functions;
const { isEgg } = InventoryItems;

interface Attributes { }

@Component({ tag: "Inventory" })
export class Inventory extends BaseComponent<Attributes, ScrollingFrame> implements DataLinked {
  public constructor(
    private readonly ui: UIController,
    private readonly notification: NotificationController
  ) { super(); }

  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== "inventory") return;
    this.updateItems(<InventoryItem[]>value);
  }

  private updateItems(inventory: InventoryItem[]): void {
    for (const card of this.instance.GetChildren().filter(i => i.IsA("Frame")))
      card.Destroy();

    for (const item of inventory) {
      const card = Assets.UI.InventoryCard.Clone();
      card.Title.Text = item.name;

      if (isEgg(item))
        newEggMesh(item, { parent: card.Viewport });

      this.maid.GiveTask(card.Buttons.Sell.MouseButton1Click.Connect(() => {
        // ugh i still gotta do this?? shit...
        // UGHH FUCK
        print("sell item");
      }));

      this.maid.GiveTask(card.Buttons.Use.MouseButton1Click.Connect(async () => {
        if (isEgg(item)) {
          const hatchery = <Hatchery>await getBuildingData("HATCHERY")
          const hatcheryModel = getPlacedBuilding<HatcheryModel>("HATCHERY");
          const max = <HatcheryMaximums>require(hatcheryModel.Maximums);
          const currentEggs = hatcheryModel.Eggs.GetChildren().size();
          const maxEggs = max.eggs[hatchery.level - 1];
          if (currentEggs >= maxEggs)
            return this.notification.dispatch("Cannot add egg to hatchery, hatchery is full.", NotificationType.Error);

          addEggToHatchery(item);
          this.ui.open("Main");
        } else {
          print("use item");
        }
      }));

      card.Parent = this.instance;
      this.maid.GiveTask(card);
    }
  }
}
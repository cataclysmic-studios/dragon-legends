import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { PlacementController } from "client/controllers/placement-controller";
import { Assets, BuildingCategory, suffixedNumber } from "shared/util";
import { Events, Functions } from "client/network";

interface Attributes {}

@Component({ tag: "ShopContent" })
export class ShopContent extends BaseComponent<Attributes, ScrollingFrame> implements OnStart {
  private readonly placement = Dependency<PlacementController>();

  public onStart(): void {
    const contentType = <BuildingCategory>this.instance.Parent?.Name!;
    const items = <Model[]>Assets.FindFirstChild(contentType)!.GetChildren();

    for (const item of items) {
      const card = Assets.UI.ItemCard.Clone();
      card.Title.Text = item.Name;

      const viewportModel = item.Clone();
      viewportModel.PrimaryPart!.Position = new Vector3;
      viewportModel.Parent = card.Viewport;

      const price = <number>item.GetAttribute("Price");
      card.Purchase.Container.Price.Text = suffixedNumber(price);

      let db = false
      card.Purchase.MouseButton1Click.Connect(async () => {
        if (db) return;
        db = true;

        const gold = <number>(await Functions.getData("gold"));
        if (price > gold) return;
        Events.setData("gold", gold - price);
        this.placement.place(item.Name, contentType);

        task.wait(0.5);
        db = false;
      });

      card.Parent = this.instance;
    }
  }
}
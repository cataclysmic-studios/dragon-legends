import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { InventoryItem, InventoryItems } from "shared/data-models";
import { Assets } from "shared/util";
import { Events } from "client/network";

const { dataUpdate } = Events;
const { isEgg } = InventoryItems;

interface Attributes {}

@Component({ tag: "Inventory" })
export class Inventory extends BaseComponent<Attributes, ScrollingFrame> implements OnStart {
  public async onStart(): Promise<void> {
    dataUpdate.connect((key, value) => {
      if (key !== "inventory") return;
      this.updateItems(<InventoryItem[]>value);
    });
  }

  private updateItems(inventory: InventoryItem[]): void {
    for (const item of inventory) {
      const card = Assets.UI.InventoryCard.Clone();
      card.Title.Text = item.name;

      const viewportCamera = new Instance("Camera");
      viewportCamera.CFrame = World.ViewportCamera.CFrame;
      viewportCamera.FieldOfView = 60;
      viewportCamera.Parent = card.Viewport;
      card.Viewport.CurrentCamera = viewportCamera;
      
      if (isEgg(item)) {
        const eggMesh = <MeshPart>Assets.Eggs.WaitForChild(item.name).Clone();
        eggMesh.Position = new Vector3;
        eggMesh.Parent = card.Viewport;
      }

      this.maid.GiveTask(card.Buttons.Sell.MouseButton1Click.Connect(() => {
        print("sell item");
      }));

      this.maid.GiveTask(card.Buttons.Use.MouseButton1Click.Connect(() => {
        if (isEgg(item)) {
          print("send egg to hatchery");
        } else {
          print("use item");
        }
      }));

      card.Parent = this.instance;
      this.maid.GiveTask(card);
    }
  }
}
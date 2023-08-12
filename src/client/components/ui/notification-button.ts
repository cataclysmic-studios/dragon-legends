import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Assets } from "shared/util";

interface Attributes {
  Amount: number;
}

@Component({ tag: "NotificationButton" })
export class NotificationButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly notificationFrame = Assets.UI.ButtonNotification.Clone();

  public onStart(): void {
    this.notificationFrame.Parent = this.instance;
    this.notificationFrame.Visible = false;
    this.notificationFrame.GetAttributeChangedSignal("Amount")
      .Connect(() => {
        this.notificationFrame.Visible = this.attributes.Amount !== 0;
        this.notificationFrame.Amount.Text = tostring(this.attributes.Amount);
      });

    this.maid.GiveTask(this.notificationFrame);
    this.maid.GiveTask(this.instance.MouseButton1Click.Connect(() => this.set(0)));
    this.set(0);
  }

  public set(value: number): void {
    this.attributes.Amount = value;
  }

  public add(value = 1): void {
    this.attributes.Amount += value;
  }
}
import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Assets } from "shared/utilities/helpers";
import { Events } from "client/network";

const { addNotificationToButton } = Events;

interface Attributes { }

@Component({ tag: "NotificationButton" })
export class NotificationButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly notificationFrame = Assets.UI.ButtonNotification.Clone();

  public onStart(): void {
    this.notificationFrame.Parent = this.instance;
    addNotificationToButton.connect(buttonName => {
      if (buttonName !== this.instance.Name) return;
      this.add();
    });

    this.notificationFrame.GetAttributeChangedSignal("Amount")
      .Connect(() => {
        const amount = this.getAmount();
        this.notificationFrame.Visible = amount > 0;
        this.notificationFrame.Amount.Text = tostring(amount);
      });

    this.maid.GiveTask(this.notificationFrame);
    this.maid.GiveTask(this.instance.MouseButton1Click.Connect(() => this.set(0)));
    this.set(0);
  }

  public getAmount(): number {
    return this.notificationFrame.GetAttribute<number>("Amount");
  }

  public set(value: number): void {
    this.notificationFrame.SetAttribute("Amount", value);
  }

  public add(value = 1): void {
    const amount = this.getAmount();
    this.set(amount + value);
  }
}
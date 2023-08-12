import { Controller, Dependency } from "@flamework/core";
import { UIController } from "./ui-controller";
import { tween } from "shared/util";
import { TweenInfoBuilder } from "@rbxts/builders";

const { EasingStyle } = Enum;

export const enum NotificationType {
  Note,
  Warning,
  Error
}

type NotificationLabel = TextLabel & {
  UIStroke: UIStroke;
};

@Controller()
export class NotificationController {
  private readonly ui = Dependency<UIController>();
  private readonly screen = this.ui.getScreen<{
    Container: Frame;
  }>("Notifications");

  public dispatch(message: string, type: NotificationType): void {
    const label = this.createNotificationLabel(message, type);
    label.Parent = this.screen.Container;

    const tweenInfo = new TweenInfoBuilder()
      .SetEasingStyle(EasingStyle.Quad)
      .SetTime(1);

    tweenInfo.SetDelayTime(4);
    tween(label, tweenInfo, { TextTransparency: 1 });
    tween(label.UIStroke, tweenInfo, { Transparency: 1 })
      .Completed.Once(() => label.Destroy());
  }

  private createNotificationLabel(text: string, type: NotificationType): NotificationLabel {
    const label = new Instance("TextLabel");
    label.FontFace = new Font("Gotham", Enum.FontWeight.ExtraBold);
    label.Size = UDim2.fromScale(1, 0.1);
    label.TextColor3 = this.getNotificationColor(type);
    label.TextScaled = true;
    label.Text = text;
    
    const stroke = new Instance("UIStroke", label);
    stroke.Thickness = 2;
    stroke.Transparency = 0.4;

    return <NotificationLabel>label;
  }

  private getNotificationColor(type: NotificationType) {
    switch (type) {
      case NotificationType.Note:
        return Color3.fromRGB(255, 255, 255);
      case NotificationType.Warning:
        return Color3.fromRGB(255, 219, 87);
      case NotificationType.Error:
        return Color3.fromRGB(255, 55, 58);
    }
  }
}
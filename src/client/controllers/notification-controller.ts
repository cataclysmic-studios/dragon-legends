import { Controller } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";
import { UIController } from "./ui-controller";
import { tween } from "shared/util";

const { EasingStyle, Font } = Enum;

export const enum NotificationType {
  Note,
  Warning,
  Error
}

interface NotificationLabel extends TextLabel {
  UIStroke: UIStroke;
}

@Controller()
export class NotificationController {
  private readonly screen;

  public constructor(
    private readonly ui: UIController
  ) {
    this.screen = this.ui.getScreen<{
      Container: Frame;
    }>("Notifications");
  }

  public dispatch(message: string, notificationType = NotificationType.Note): void {
    const label = this.createNotificationLabel(message, notificationType);
    label.Parent = this.screen.Container;

    const tweenInfo = new TweenInfoBuilder()
      .SetEasingStyle(EasingStyle.Quad)
      .SetTime(1);

    tweenInfo.SetDelayTime(4);
    tween(label, tweenInfo, { TextTransparency: 1 });
    tween(label.UIStroke, tweenInfo, { Transparency: 1 })
      .Completed.Once(() => label.Destroy());
  }

  private createNotificationLabel(text: string, notificationType: NotificationType): NotificationLabel {
    const label = new Instance("TextLabel");
    label.BackgroundTransparency = 1;
    label.Font = Font.GothamBlack;
    label.Size = UDim2.fromScale(1, 0.1);
    label.TextColor3 = this.getNotificationColor(notificationType);
    label.TextScaled = true;
    label.Text = text;
    
    const stroke = new Instance("UIStroke", label);
    stroke.Thickness = 2;
    stroke.Transparency = 0.4;

    return <NotificationLabel>label;
  }

  private getNotificationColor(notificationType: NotificationType) {
    switch (notificationType) {
      case NotificationType.Note:
        return Color3.fromRGB(255, 255, 255);
      case NotificationType.Warning:
        return Color3.fromRGB(255, 219, 87);
      case NotificationType.Error:
        return Color3.fromRGB(255, 55, 58);
    }
  }
}
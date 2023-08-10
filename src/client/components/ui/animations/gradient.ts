import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenService as Tween } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import AnimationComponent from "client/base-components/animation-component";

interface Attributes {
  OffsetGoal: Vector2;
}

const { EasingStyle } = Enum;

@Component({ tag: "GradientAnimation" })
export class GradientAnimation extends AnimationComponent<Attributes, GuiButton & { UIGradient: UIGradient; }> implements OnStart {
  private readonly defaultOffset = this.instance.UIGradient.Offset;
  protected override readonly includeClick = false;
  
  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(0.15);

  public onStart(): void {
    this.connectEvents();
  }

  public active(): void {
    Tween.Create(this.instance.UIGradient, this.tweenInfo.Build(), {
      Offset: this.attributes.OffsetGoal
    }).Play();
  }

  public inactive(): void {
    Tween.Create(this.instance.UIGradient, this.tweenInfo.Build(), {
      Offset: this.defaultOffset
    }).Play();
  }
}
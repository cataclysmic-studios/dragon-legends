import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { TweenService as Tween } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import AnimationComponent from "client/base-components/animation-component";

const { EasingStyle } = Enum;

@Component({ tag: "SpringAnimation" })
export class SpringAnimation extends AnimationComponent implements OnStart {
  private readonly scale = new Instance("UIScale", this.instance);
  private readonly scaleIncrement = 0.05;
  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Elastic)
    .SetTime(0.35);

  public onStart(): void {
    this.connectEvents();
  }

  public onHover(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1 + this.scaleIncrement
    }).Play();
  }

  public onLeave(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1
    }).Play();
  }

  public onDown(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1
    }).Play();
  }

  public onUp(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1 + this.scaleIncrement
    }).Play();
  }
}
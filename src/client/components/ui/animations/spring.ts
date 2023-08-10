import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
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

  protected inactive(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1
    }).Play();
  }

  protected active(): void {
    Tween.Create(this.scale, this.tweenInfo.Build(), {
      Scale: 1 + this.scaleIncrement
    }).Play();
  }
}
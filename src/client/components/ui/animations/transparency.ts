import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { TweenService as Tween } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import AnimationComponent from "client/base-components/animation-component";

interface Attributes {
  TransparencyGoal: number;
}

const { EasingStyle } = Enum;

@Component({ tag: "TransparencyAnimation" })
export class TransparencyAnimation extends AnimationComponent<Attributes, GuiButton> {
  private readonly defaultTransparency = this.instance.Transparency;
  protected override readonly includeClick = false;
  
  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Sine)
    .SetTime(0.35);

  public active(): void {
    Tween.Create(this.instance, this.tweenInfo.Build(), {
      BackgroundTransparency: this.attributes.TransparencyGoal
    }).Play();
  }

  public inactive(): void {
    Tween.Create(this.instance, this.tweenInfo.Build(), {
      BackgroundTransparency: this.defaultTransparency
    }).Play();
  }
}
import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "shared/util";

import AnimationComponent from "client/base-components/animation-component";

interface Attributes {
  TransparencyGoal: number;
}

const { EasingStyle } = Enum;

@Component({ tag: "TransparencyAnimation" })
export class TransparencyAnimation extends AnimationComponent<Attributes> implements OnStart {
  private readonly defaultTransparency = this.instance.Transparency;
  protected override readonly includeClick = false;
  
  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(0.35);

  public onStart(): void {
    this.connectEvents();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.attributes.TransparencyGoal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.defaultTransparency
    });
  }
}
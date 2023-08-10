import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";

interface Attributes {
  Hover?: boolean;
  Click?: boolean;
}

export default abstract class AnimationComponent<
  A extends object = {},
  I extends GuiButton = GuiButton
> extends BaseComponent<Attributes & A, I> {

  protected readonly abstract tweenInfo: TweenInfoBuilder

  public abstract onHover(): void;
  public abstract onLeave(): void;
  public abstract onDown(): void;
  public abstract onUp(): void;

  public connectEvents(): void {
    this.instance.MouseButton1Down.Connect(() => this.onDown());
    this.instance.MouseButton1Up.Connect(() => this.onUp());
    this.instance.MouseEnter.Connect(() => this.onHover());
    this.instance.MouseLeave.Connect(() => this.onLeave());
  }
}
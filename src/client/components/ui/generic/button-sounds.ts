import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { SoundController } from "client/controllers/sound-controller";

interface Attributes {}

@Component({ tag: "ButtonSounds" })
export class ButtonSounds extends BaseComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly sound: SoundController
  ) { super(); }

  public onStart(): void {
    this.instance.MouseButton1Down.Connect(() => this.sound.play("ui_click"));
    this.instance.MouseEnter.Connect(() => this.sound.play("ui_hover"));
  }
}
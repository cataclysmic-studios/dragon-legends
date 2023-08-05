import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

interface Attributes {}

@Component({ tag: "UIButton" })
export class UIButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  public onStart(): void {
    this.instance.MouseButton1Click.Connect(() => {
      switch (this.instance.Name) {
        case "Shop":
          
          break;
      }
    });
  }
}
import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";

interface Attributes {}

@Component({ tag: "UIButton" })
export class UIButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    this.instance.MouseButton1Click.Connect(() => {
      switch (this.instance.Name) {
        case "Shop":
          this.ui.open("Shop");
          break;
        case "Close":
          this.ui.open("Main");
          break;
      }
    });
  }
}
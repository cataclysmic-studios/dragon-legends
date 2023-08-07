import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";

interface Attributes {
  PageRoute?: boolean;
}

@Component({ tag: "UIButton" })
export class UIButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);

    this.instance.MouseButton1Click.Connect(() => {
      switch (this.instance.Name) {
        case "Shop":
          this.ui.open("Shop");
          break;
        case "Close":
          this.ui.open("Main");
          break;

        default:
          if (!this.attributes.PageRoute) return;
          this.ui.setPage(gui.Name, this.instance.Name);
          break;
      }
    });
  }
}
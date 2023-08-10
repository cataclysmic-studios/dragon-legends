import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";

interface Attributes {}

@Component({ tag: "PageRouteButton" })
export class PageRouteButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);
    this.instance.MouseButton1Click.Connect(() => 
      this.ui.setPage(gui.Name, this.instance.Name)
    );
  }
}
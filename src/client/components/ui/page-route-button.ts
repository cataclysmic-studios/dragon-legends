import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";

interface Attributes {}

@Component({ tag: "PageRouteButton" })
export class PageRouteButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly ui: UIController
  ) { super(); }

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);
    this.maid.GiveTask(this.instance.MouseButton1Click.Connect(() => 
      this.ui.setPage(gui.Name, this.instance.Name)
    ));
  }
}
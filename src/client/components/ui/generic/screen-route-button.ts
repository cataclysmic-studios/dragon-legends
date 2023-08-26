import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui/ui-controller";

interface Attributes {
  To?: string;
}

@Component({ tag: "ScreenRouteButton" })
export class ScreenRouteButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly ui: UIController
  ) { super(); }

  public onStart(): void {
    this.maid.GiveTask(this.instance.MouseButton1Click.Connect(() =>
      this.ui.open(this.attributes.To ?? this.instance.Name)
    ));
  }
}
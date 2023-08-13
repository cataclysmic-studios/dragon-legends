import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";
import { MissingAttributeException } from "shared/exceptions";

interface Attributes {
  To?: string;
}

@Component({ tag: "UIButton" })
export class UIButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly ui: UIController
  ) { super(); }

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);
    this.maid.GiveTask(
      this.instance.MouseButton1Click.Connect(() => {
        switch (this.instance.Name) {
          case "Back": {
            const mainPage = gui.GetAttribute<Maybe<string>>("MainPage");
            if (!mainPage && !this.attributes.To)
              throw new MissingAttributeException(gui, "MainPage");
  
            this.ui.setPage(gui.Name, this.attributes.To ?? mainPage!);
            break;
          }
          
          case "Inventory":
          case "Shop":
            this.ui.open(this.instance.Name);
            break;
          case "Close":
            this.ui.open("Main");
            break;
        }
      })
    );
  }
}
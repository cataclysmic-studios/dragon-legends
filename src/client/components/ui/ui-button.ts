import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { MissingAttributeException } from "shared/exceptions";
import { UIController } from "client/controllers/ui-controller";

interface Attributes {
  To?: string;
}

@Component({ tag: "UIButton" })
export class UIButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);
    this.maid.GiveTask(
      this.instance.MouseButton1Click.Connect(() => {
        switch (this.instance.Name) {
          case "Back": {
            const mainPage = gui.GetAttribute<Maybe<string>>("MainPage");
            if (!mainPage && !this.attributes.To)
              return new MissingAttributeException(gui, "MainPage");
  
            this.ui.setPage(gui.Name, this.attributes.To ?? mainPage!);
            break;
          }
          
          case "Shop":
            this.ui.open("Shop");
            break;
          case "Close":
            this.ui.open("Main");
            break;
        }
      })
    );
  }
}
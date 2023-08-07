import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";
import { MissingAttributeException } from "shared/exceptions";

interface Attributes {
  To?: string;
}

@Component({ tag: "BackButton" })
export class BackButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const gui = this.ui.getScreen(this.instance);

    this.instance.MouseButton1Click.Connect(() => {
      const mainPage = <Maybe<string>>gui.GetAttribute("MainPage");
      if (!mainPage && !this.attributes.To)
        return new MissingAttributeException(gui, "MainPage");

      this.ui.setPage(gui.Name, this.attributes.To ?? mainPage!);
    });
  }
}
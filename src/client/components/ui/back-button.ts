import { Dependency, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UIController } from "client/controllers/ui-controller";
import { Exception, MissingAttributeException } from "shared/exceptions";

interface Attributes {
  To: string;
}

@Component({ tag: "BackButton" })
export class BackButton extends BaseComponent<Attributes, GuiButton> implements OnStart {
  private readonly ui = Dependency<UIController>();

  public onStart(): void {
    const parentGui = this.instance.FindFirstAncestorOfClass("ScreenGui")!;
    
    this.instance.MouseButton1Click.Connect(() => {
      const mainPage = parentGui.GetAttribute("MainPage");
      if (!mainPage)
        throw new MissingAttributeException(parentGui, "MainPage");

      this.ui.setPage(parentGui.Name, "Menu");
    });
  }
}
import { Controller, Dependency } from "@flamework/core";
import { PlayerController } from "./player-controller";
import { CollectionService as Collection } from "@rbxts/services";

@Controller()
export class UIController {
  private readonly player = Dependency<PlayerController>();

  public open(name: string): void {
    const guis = <ScreenGui[]>this.player.gui.GetChildren();

    for (const gui of guis) {
      const on = gui.Name === name;
      gui.Enabled = on;

      if (on) {
        const mainPage = <Maybe<string>>gui.GetAttribute("MainPage");
        if (mainPage)
          this.setPage(gui.Name, mainPage);
      }
    }
  }

  public setPage(uiName: string, pageName: string): void {
    const gui = <ScreenGui>this.player.gui.WaitForChild(uiName);
    const pages = <GuiObject[]>gui.GetChildren().filter(e => Collection.HasTag(e, "Page"));

    for (const page of pages)
      page.Visible = page.Name === pageName;
  }

  public getScreen(instance: GuiBase): ScreenGui {
    return instance.FindFirstAncestorOfClass("ScreenGui")!;
  }
}
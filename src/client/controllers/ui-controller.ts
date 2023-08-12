import { Controller, Dependency } from "@flamework/core";
import { PlayerController } from "./player-controller";
import { CollectionService as Collection } from "@rbxts/services";

@Controller()
export class UIController {
  private readonly player = Dependency<PlayerController>();
  public current = "Main";

  public open(name: string): void {
    const guis = <ScreenGui[]>this.player.gui.GetChildren();
    this.current = name;

    for (const gui of guis)
      if (!Collection.HasTag(gui, "OverlayScreen")) {
        const on = gui.Name === name;
        gui.Enabled = on;

        if (on) {
          const mainPage = gui.GetAttribute<Maybe<string>>("MainPage") ?? "Main";
          this.setPage(gui.Name, mainPage);
        }
      }
  }

  public setPage(guiName: string, pageName: string): GuiObject {
    const gui = this.getScreen(guiName);
    const pages = <GuiObject[]>gui.GetChildren()
      .filter(e => Collection.HasTag(e, "Page"));

    for (const page of pages)
      page.Visible = page.Name === pageName;

    return pages.find(page => page.Name === pageName)!;
  }

  public getScreen<Children extends {} = {}>(searchParameter: GuiBase | string): ScreenGui & Children {
    if (typeOf(searchParameter) === "Instance")
      return <ScreenGui & Children>(<GuiBase>searchParameter).FindFirstAncestorOfClass("ScreenGui")!;
    else
      return <ScreenGui & Children>this.player.gui.WaitForChild(<string>searchParameter);
  }
}
import { Controller, Dependency } from "@flamework/core";
import { PlayerController } from "./player-controller";

@Controller()
export class UIController {
  private readonly player = Dependency<PlayerController>();

  public open(name: string): void {
    const guis = <ScreenGui[]>this.player.gui.GetChildren();
    for (const gui of guis)
      gui.Enabled = gui.Name === name;
  }
}
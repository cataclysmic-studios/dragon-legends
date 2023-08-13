import { Controller } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller()
export class PlayerController {
  public readonly gui = <PlayerGui>Players.LocalPlayer.WaitForChild("PlayerGui");
}
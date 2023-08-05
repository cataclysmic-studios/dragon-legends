import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Events } from "client/network";

@Controller()
export class PlayerController implements OnStart {
  public onStart(): void {
    Events.initializeData.fire();
  }

  public readonly gui = <PlayerGui>Players.LocalPlayer.WaitForChild("PlayerGui");
}
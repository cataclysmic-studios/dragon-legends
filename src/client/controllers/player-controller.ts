import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Events } from "client/network";

@Controller()
export class PlayerController implements OnStart {
  public readonly gui = <PlayerGui>Players.LocalPlayer.WaitForChild("PlayerGui");
  
  public onStart(): void {
    Events.initializeData();
  }
}
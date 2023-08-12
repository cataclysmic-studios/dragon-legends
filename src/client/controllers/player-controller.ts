import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Events } from "client/network";

const { initializeData } = Events;

@Controller()
export class PlayerController implements OnStart {
  public readonly gui = <PlayerGui>Players.LocalPlayer.WaitForChild("PlayerGui");
  
  public onStart(): void {
    initializeData();
  }
}
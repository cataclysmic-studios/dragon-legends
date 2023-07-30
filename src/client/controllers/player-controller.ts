import { Controller, OnStart } from "@flamework/core";
import { Events } from "client/network";

@Controller()
export class PlayerController implements OnStart {
  public onStart(): void {
    Events.initializeData.fire();
  }
}
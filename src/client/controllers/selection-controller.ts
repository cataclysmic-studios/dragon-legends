import { Controller, Dependency, OnInit } from "@flamework/core";
import { CollectionService as Collection } from "@rbxts/services";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Player } from "shared/util";
import { Functions } from "client/network";

import { UIController } from "./ui-controller";
import { PlacementController } from "./placement-controller";

const { isTimerActive } = Functions;

@Controller()
export class SelectionController implements OnInit {
  
  private readonly ui = Dependency<UIController>();
  private readonly placement = Dependency<PlacementController>();
  private readonly mouse = Player.GetMouse();
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true,
    OnBefore: () => {
      if (this.placement.inPlacementMode()) return false;
      
      const instance = this.mouse.Target?.Parent;
      if (!instance) {
        this.deselect();
        return false;
      }
      
      const isBuilding = Collection.HasTag(instance, "Building");
      if (!isBuilding)
        this.deselect();
      else
        this.selectedBuildingID = instance.GetAttribute<string>("ID");
    
      return isBuilding;
    }
  });

  private selectedBuildingID?: string;

  public onInit(): void {
    this.input.Bind("MouseButton1", async () => {
      // TODO: skipping timers
      if (await isTimerActive(this.selectedBuildingID!)) return;
      this.select();
    });
  }

  private select(): void {
    // TODO: display respective buttons
    const buildingSelectFrame = this.ui.setPage("Main", "BuildingSelect");
    buildingSelectFrame.SetAttribute("ID", this.selectedBuildingID);
  }

  private deselect() {
    if (this.ui.current !== "Main") return;
    this.ui.setPage("Main", "Main");
    this.selectedBuildingID = undefined;
  }
}
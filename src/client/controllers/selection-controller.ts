import { Controller, OnInit } from "@flamework/core";
import { CollectionService as Collection } from "@rbxts/services";
import { Context as InputContext } from "@rbxts/gamejoy";
import { UIController } from "./ui-controller";
import { BuildingPlacementController } from "./building-placement-controller";

import { Player } from "shared/util";
import { Functions } from "client/network";

const { isTimerActive } = Functions;

@Controller()
export class SelectionController implements OnInit {
  private readonly buildingSelectFrame;
  private readonly mouse = Player.GetMouse();
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true,
    OnBefore: () => this.canClick()
  });

  private selectedBuildingID?: string;

  public constructor(
    private readonly ui: UIController,
    private readonly building: BuildingPlacementController
  ) {
    this.buildingSelectFrame = this.ui.getPage("Main", "BuildingSelect");
  }

  public onInit(): void {
    this.input.Bind(["MouseButton1", "Touch"], async () => {
      // TODO: skipping timers
      if (await isTimerActive(this.selectedBuildingID!)) return;
      this.select();
    });
  }

  private select(): void {
    this.setID();
    this.ui.setPage("Main", "BuildingSelect");
  }

  private deselect() {
    if (this.ui.current !== "Main") return;
    this.selectedBuildingID = undefined;
    this.setID();
    this.ui.setPage("Main", "Main");
  }

  private setID(): void {
    this.buildingSelectFrame.SetAttribute("ID", this.selectedBuildingID);
  }
  
  private canClick(): boolean {
    if (this.building.inPlacementMode())
      return false;
      
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
}
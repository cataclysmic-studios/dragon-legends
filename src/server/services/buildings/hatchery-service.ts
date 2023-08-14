import { Service, OnInit } from "@flamework/core";
import { DataService } from "../data-service";
import { TimerService } from "../timer-service";

import { Egg } from "shared/data-models/inventory";
import { Hatchery } from "shared/data-models/buildings";
import { Assets, getPlacedBuildingModel, newEggMesh } from "shared/util";
import { Events } from "server/network";

const { addEggToHatchery } = Events;

@Service()
export class HatcheryService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly timer: TimerService
  ) {}

  public onInit(): void {
    addEggToHatchery.connect((player, egg, isLoaded) => this.addEgg(player, egg, isLoaded));
  }

  // check if hatchery is full before calling
  private addEgg(player: Player, egg: Egg, isLoading = false): void {
    const hatchery = this.data.findBuilding<Hatchery>(player, "HATCHERY");
    const hatcheryModel = getPlacedBuildingModel<HatcheryModel>("HATCHERY");
    const eggPositionIndex = tostring(hatchery.eggs.size() + 1);
    const eggPositionPart = <Part>hatcheryModel.EggPositions.WaitForChild(eggPositionIndex);
    newEggMesh(egg, {
      position: eggPositionPart.Position, 
      parent: hatcheryModel.Eggs,
      attributes: { ID: egg.id }
    });
    
    this.data.removeBuilding(player, "HATCHERY");
    hatchery.eggs = [ ...hatchery.eggs, egg ];
    this.data.addBuilding(player, hatchery);

    if (isLoading) return; // don't add timer to eggs being loaded by BuildingLoaderService
    this.timer.addHatchTimer(player, egg.id, egg.hatchTime);
  }
}
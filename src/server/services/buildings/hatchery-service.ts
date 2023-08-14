import { Service, OnInit } from "@flamework/core";
import { DataService } from "../data-service";
import { TimerService } from "../timer-service";

import { Egg } from "shared/data-models/inventory";
import { Hatchery } from "shared/data-models/buildings";
import { getPlacedBuilding, newEggMesh } from "shared/util";
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
    const hatcheryModel = getPlacedBuilding<HatcheryModel>("HATCHERY");
    const eggPositionIndex = tostring(hatchery.eggs.size() + 1);
    const eggPositionPart = <Part>hatcheryModel.EggPositions.WaitForChild(eggPositionIndex);
    newEggMesh(egg, {
      position: eggPositionPart.Position, 
      parent: hatcheryModel.Eggs,
      attributes: { ID: egg.id }
    });
    
    // don't edit building/timer data for eggs if egg is being loaded from BuildingLoaderService
    if (isLoading) return;
    this.data.removeBuilding(player, "HATCHERY");
    hatchery.eggs = [ ...hatchery.eggs, egg ];
    this.data.addBuilding(player, hatchery);
    this.timer.addHatchTimer(player, egg.id, egg.hatchTime);
  }
}
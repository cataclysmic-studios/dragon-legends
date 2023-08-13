import { Service, OnInit } from "@flamework/core";

import { DataService } from "../data-service";
import { Egg, Hatchery } from "shared/data-models";
import { Assets, getBuildingModel } from "shared/util";
import { Events } from "server/network";
import { TimerService } from "../timer-service";

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
    const hatcheryModel = getBuildingModel<HatcheryModel>("HATCHERY");
    const eggMesh = <MeshPart>Assets.Eggs.WaitForChild(egg.name).Clone();
    const eggPositionIndex = hatchery.eggs.size() + 1;
    const eggPositionPart = <Part>hatcheryModel.EggPositions.WaitForChild(tostring(eggPositionIndex))
    eggMesh.Position = eggPositionPart.Position;
    eggMesh.Parent = hatcheryModel.Eggs;
    
    this.data.removeBuilding(player, "HATCHERY");
    hatchery.eggs = [ ...hatchery.eggs, egg ];
    this.data.addBuilding(player, hatchery);

    if (isLoading) return; // don't add timer to eggs being loaded by BuildingLoaderService
    this.timer.addHatchTimer(player, egg.id, egg.hatchTime);
  }
}
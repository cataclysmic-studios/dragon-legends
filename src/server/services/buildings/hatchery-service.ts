import { Service, OnInit } from "@flamework/core";
import { DataService } from "../data-service";
import { TimerService } from "../timer-service";

import { Egg, InventoryItem } from "shared/data-models/inventory";
import { Hatchery } from "shared/data-models/buildings";
import { getPlacedBuilding, newEggMesh } from "shared/util";
import { Events } from "server/network";

const { addEggToHatchery, removeEggFromHatchery } = Events;

@Service()
export class HatcheryService implements OnInit {
  public constructor(
    private readonly data: DataService,
    private readonly timer: TimerService
  ) {}

  public onInit(): void {
    addEggToHatchery.connect((player, egg, isLoaded) => this.addEgg(player, egg, isLoaded));
    removeEggFromHatchery.connect((player, eggID) => this.removeEgg(player, eggID));
  }

  private removeEgg(player: Player, eggID: string): void {
    const hatchery = this.data.getBuildingData<Hatchery>(player, "HATCHERY");
    const hatcheryModel = getPlacedBuilding<HatcheryModel>("HATCHERY");
    hatcheryModel.Eggs
      .GetChildren()
      .find(egg => egg.GetAttribute<string>("ID") === eggID)
      ?.Destroy();

    hatchery.eggs = hatchery.eggs.filter(egg => egg.id !== eggID);
    this.data.removeBuildingData(player, "HATCHERY");
    this.data.addBuildingData(player, hatchery);
  }

  // check if hatchery is full before calling
  private addEgg(player: Player, egg: Egg, isLoading = false): void {
    const inventory = this.data.get<InventoryItem[]>(player, "inventory");
    const newInventory = inventory.filter(i => i.id !== egg.id);
    this.data.set(player, "inventory", newInventory);

    const hatchery = this.data.getBuildingData<Hatchery>(player, "HATCHERY");
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
    this.data.removeBuildingData(player, "HATCHERY");
    hatchery.eggs = [ ...hatchery.eggs, egg ];
    this.data.addBuildingData(player, hatchery);
    this.timer.addHatchTimer(player, egg.id, egg.hatchTime);
  }
}
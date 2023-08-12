import { Service, OnInit } from "@flamework/core";

import { DataService } from "../data-service";
import { Egg, Hatchery } from "shared/data-models";
import { Assets, getBuildingModel } from "shared/util";
import { Events } from "server/network";

const { addEgg } = Events;

@Service()
export class HatcheryService implements OnInit {
  public constructor(
    private readonly data: DataService
  ) {}

  public onInit(): void {
    addEgg.connect((player, egg) => this.addEgg(player, egg));
  }

  // check if hatchery is full before calling
  private addEgg(player: Player, egg: Egg): void {
    const hatchery = this.data.findBuilding<Hatchery>(player, "HATCHERY");
    const hatcheryModel = getBuildingModel<HatcheryModel>("HATCHERY");
    const eggMesh = <MeshPart>Assets.Eggs.WaitForChild(egg.name).Clone();
    const eggPositionIndex = hatchery.eggs.size() + 1;
    const eggPositionPart = <Part>hatcheryModel.EggPositions.WaitForChild(tostring(eggPositionIndex))
    eggMesh.Position = eggPositionPart.Position;
    
    this.data.removeBuilding(player, "HATCHERY");
    hatchery.eggs = [ ...hatchery.eggs, egg ];
    this.data.addBuilding(player, hatchery);
  }
}
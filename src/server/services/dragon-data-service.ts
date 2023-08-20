import { Service, OnInit } from "@flamework/core";
import { Dragon } from "shared/data-models/dragons";
import { DataService } from "./data-service";
import { Events } from "server/network";

const { updateDragonData } = Events;

@Service()
export class DragonDataService implements OnInit {
  public constructor(
    private readonly data: DataService
  ) { }

  public onInit(): void {
    updateDragonData.connect((player, dragon) => this.updateData(player, dragon))
  }

  public updateData(player: Player, dragon: Dragon): void {
    this.removeData(player, dragon.id);
    this.addData(player, dragon);
  }

  public addData(player: Player, dragon: Dragon): void {
    const dragons = this.data.get<Dragon[]>(player, "dragons");
    dragons.push(dragon);
    this.data.set(player, "dragons", dragons);
  }

  public removeData(player: Player, dragonID: string): void {
    const dragons = this.data.get<Dragon[]>(player, "dragons");
    const newDragons = dragons.filter(d => d.id !== dragonID);
    this.data.set(player, "dragons", newDragons);
  }

  public getData(player: Player, dragonID: string): Maybe<Dragon> {
    const dragons = this.data.get<Dragon[]>(player, "buildings");
    return dragons.find(dragon => dragon.id === dragonID);
  }
}
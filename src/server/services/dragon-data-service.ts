import { Service, OnInit } from "@flamework/core";
import { Dragon } from "shared/data-models/dragons";
import { DataService } from "./data-service";
import { Events } from "server/network";

const { addDragonXP } = Events;

@Service()
export class DragonDataService implements OnInit {
  public constructor(
    private readonly data: DataService
  ) { }

  public onInit(): void {
    addDragonXP.connect((player, id) => {
      const dragon = this.get(player, id);
      if (!dragon) return;
      dragon.xp++;
      this.update(player, dragon);
    });
  }

  public update(player: Player, dragon: Dragon): void {
    this.remove(player, dragon.id);
    this.add(player, dragon);
  }

  public add(player: Player, dragon: Dragon): void {
    const dragons = this.data.get<Dragon[]>(player, "dragons");
    dragons.push(dragon);
    this.data.set(player, "dragons", dragons);
  }

  public remove(player: Player, dragonID: string): void {
    const newDragons = this.data
      .get<Dragon[]>(player, "dragons")
      .filter(d => d.id !== dragonID);

    this.data.set(player, "dragons", newDragons);
  }

  public get(player: Player, dragonID: string): Maybe<Dragon> {
    return this.data
      .get<Dragon[]>(player, "dragons")
      .find(dragon => dragon.id === dragonID);
  }
}
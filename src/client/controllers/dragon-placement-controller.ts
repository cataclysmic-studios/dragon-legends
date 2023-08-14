import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import StringUtils from "@rbxts/string-utils";

import { UIController } from "./ui-controller";
import { NotificationController } from "./notification-controller";

import { Element } from "shared/data-models/dragons";
import { Player, getDragonData, newDragonModel } from "shared/util";
import { Events, Functions } from "client/network";

const { setData, placeDragon } = Events;
const { getData, isTimerActive } = Functions;

// TODO: move() method, green/red highlight, some damn limits

const { floor } = math;

@Controller()
export class DragonPlacementController {
  private readonly janitor = new Janitor;
  private readonly mouse = Player.GetMouse();

  public constructor(
    private readonly ui: UIController,
    private readonly notification: NotificationController
  ) {}

  public async place(dragonName: string): Promise<boolean | void> {
    // TODO: check space left in habitat
    const dragonModel = newDragonModel(dragonName);
    const dragon = getDragonData(dragonModel);
    dragonModel.Destroy();

    const habitats = <HabitatModel[]>World.Buildings.GetChildren()
      .filter(b => StringUtils.endsWith(b.Name, "Habitat"));

    const usableHabitats: HabitatModel[] = [];
    for (const habitat of habitats) {
      const [ element ] = <[Element, string]>habitat.Name.split(" ");
      const id = habitat.GetAttribute<string>("ID");
      const usable = dragon.elements.includes(element) && !await isTimerActive(id);
      habitat.Highlight.Enabled = usable;

      if (usable)
        usableHabitats.push(habitat);
    }

    if (usableHabitats.size() === 0)
      return this.notification.dispatch("Cannot place dragon: you own no usable habitats for this dragon.");

    this.ui.setPage("Main", "None");
    this.janitor.Add(this.mouse.Button1Down.Connect(() => {
      const habitat = <Maybe<HabitatModel>>this.mouse.Target?.Parent;
      if (!habitat) return;
      if (!usableHabitats.includes(habitat)) return;

      const habitatID = habitat.GetAttribute<string>("ID");
      placeDragon(dragon, habitatID);
      this.janitor.Cleanup();
    }));

    this.janitor.Add(async () => {
      const gold = <number>await getData("gold");
      setData("gold", gold - dragon.price);

      this.ui.setPage("Main", "Main");
      for (const habitat of habitats)
        habitat.Highlight.Enabled = false;
    });

    return true;
  }
}
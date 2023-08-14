import { Controller, OnInit, OnRender } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Union } from "@rbxts/gamejoy/out/Actions";
import { Janitor } from "@rbxts/janitor";
import StringUtils from "@rbxts/string-utils";

import { UIController } from "./ui-controller";
import { NotificationController } from "./notification-controller";

import { Element } from "shared/data-models/dragons";
import { Assets, Placable, Player, getDragonData, getMouseWorldPosition, newDragonModel } from "shared/util";
import { Events, Functions } from "client/network";

const { setData, placeBuilding, placeDragon } = Events;
const { getData, isTimerActive } = Functions;

// TODO: move() method, green/red highlight, some damn limits

const { floor } = math;

@Controller()
export class PlacementController implements OnRender, OnInit {
  private readonly janitor = new Janitor;
  private readonly mouse = Player.GetMouse();
  private readonly gridSize = 4;

  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  private currentlyPlacing?: Model;
  private targetOnClick?: Instance;
  private mouseDown = false;

  public constructor(
    private readonly ui: UIController,
    private readonly notification: NotificationController
  ) {}

  public inPlacementMode(): boolean {
    return this.currentlyPlacing !== undefined;
  }

  public isDragging(): boolean {
    return this.inPlacementMode() && this.mouse.Target?.Parent?.Name === this.currentlyPlacing!.Name;
  }

  public onInit(): void | Promise<void> {
    const click = new Union(["MouseButton1", "Touch"]);
    this.input
      .Bind(click, () => {
        this.mouseDown = true;
        this.targetOnClick = this.mouse.Target;
      })
      .BindEvent("onRelease", click.Released, () => {
        this.mouseDown = false;
      });

    this.mouse.TargetFilter = World.Ignore;
  }

  public onRender(dt: number): void {
    if (!this.currentlyPlacing || !this.mouseDown) return;
    if (this.currentlyPlacing.Name !== this.targetOnClick?.Parent?.Name) return;

    const position = this.snap(getMouseWorldPosition());
    this.currentlyPlacing.PrimaryPart!.Position = position;
  }

  private snapCoord(n: number): number {
    return floor(n / this.gridSize + 0.5) * this.gridSize;
  }

  private snap({ X, Z }: Vector3): Vector3 {
    const rootPart = this.currentlyPlacing!.PrimaryPart!;
    return new Vector3(this.snapCoord(X), rootPart.Size.Y / 2, this.snapCoord(Z));
  }

  public async placeDragon(dragonName: string): Promise<boolean | void> {
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

  public place(buildingName: string, category: Placable): void {
    this.toggleGrid(true);
    this.currentlyPlacing = <Model>Assets.WaitForChild(category).WaitForChild(buildingName).Clone();

    const camPosition = World.Ignore.PlayerCamera.Position;
    this.currentlyPlacing.PrimaryPart!.Position = this.snap(camPosition.add(new Vector3(12, 0, 12)));
    this.currentlyPlacing.Parent = World.CurrentCamera;

    const placementConfirmation = <Frame & {
      Confirm: ImageButton;
      Cancel: ImageButton;
    }>this.ui.setPage("Main", "PlacementConfirmation");

    this.janitor.Add(this.currentlyPlacing);
    this.janitor.Add(() => this.ui.setPage("Main", "Main"));
    this.janitor.Add(placementConfirmation.Confirm.MouseButton1Click.Once(async () => {
      const position = this.currentlyPlacing!.PrimaryPart!.Position;
      const price = <number>this.currentlyPlacing!.GetAttribute("Price");
      const gold = <number>await getData("gold");
      setData("gold", gold - price);
      placeBuilding(buildingName, category, position);
      this.cancelPlacement();
    }));

    this.janitor.Add(placementConfirmation.Cancel.MouseButton1Click.Once(
      () => this.cancelPlacement()
    ));
  }

  private cancelPlacement(): void {
    this.toggleGrid(false);
    this.janitor.Cleanup();
    this.currentlyPlacing = undefined;
  }

  private toggleGrid(on: boolean) {    
    const enabledTransparency = 0.5
    const islands = <Island[]>World.Islands.GetChildren();
    for (const island of islands)
      island.Grid.Transparency = on ? enabledTransparency : 1;
  }
}
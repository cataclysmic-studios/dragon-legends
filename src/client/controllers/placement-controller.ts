import { Controller, Dependency, OnInit, OnRender } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";
import { UserInputService, Workspace as World } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { Assets, BuildingCategory, Player } from "shared/util";
import { UIController } from "./ui-controller";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Action } from "@rbxts/gamejoy/out/Actions";

// TODO: move() method, green/red aura

const { floor } = math;

@Controller()
export class PlacementController implements OnRender, OnInit {
  private readonly ui = Dependency<UIController>();
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

  public inPlacementMode(): boolean {
    return this.currentlyPlacing !== undefined;
  }

  public isDragging(): boolean {
    return this.inPlacementMode() && this.mouse.Target?.Parent?.Name === this.currentlyPlacing!.Name;
  }

  public onInit(): void | Promise<void> {
    const mb1 = new Action("MouseButton1");
    this.input
      .Bind(mb1, () => {
        this.mouseDown = true;
        this.targetOnClick = this.mouse.Target;
      })
      .BindEvent("onRelease", mb1.Released, () => {
        this.mouseDown = false;
      });

    this.mouse.TargetFilter = World.Ignore;
  }

  public onRender(dt: number): void {
    if (!this.currentlyPlacing || !this.mouseDown) return;
    if (this.currentlyPlacing.Name !== this.targetOnClick?.Parent?.Name) return;

    const position = this.snap(this.mouse.Hit.Position);
    this.currentlyPlacing.PrimaryPart!.Position = position;
  }

  private snapCoord(n: number): number {
    return floor(n / this.gridSize + 0.5) * this.gridSize;
  }

  private snap({ X, Z }: Vector3): Vector3 {
    return new Vector3(this.snapCoord(X), 0, this.snapCoord(Z));
  }

  public place(buildingName: string, category: BuildingCategory): void {
    this.toggleGrid(true);
    this.currentlyPlacing = Assets[category][buildingName].Clone();

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
      const gold = <number>(await Functions.getData("gold"));
      Events.setData("gold", gold - price);
      Events.placeBuilding(buildingName, category, position);
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
import { Controller, OnInit, OnRender } from "@flamework/core";
import { CollectionService as Collection, Workspace as World } from "@rbxts/services";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Union } from "@rbxts/gamejoy/out/Actions";
import { Janitor } from "@rbxts/janitor";

import { UIController } from "./ui-controller";

import { Assets, Placable, Player, getMouseWorldPosition, toRegion3 } from "shared/util";
import { Events } from "client/network";

const { incrementData, placeBuilding } = Events;

// TODO: move() method

const { floor } = math;

@Controller()
export class BuildingPlacementController implements OnRender, OnInit {
  private readonly janitor = new Janitor;
  private readonly mouse = Player.GetMouse();
  private readonly gridSize = 4;

  private readonly canPlaceColor = Color3.fromHex("#50ff3c");
  private readonly cannotPlaceColor = Color3.fromHex("#ff3d3d");
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  private currentlyPlacing?: Model;
  private currentHighlight?: Highlight;
  private targetOnClick?: Instance;
  private mouseDown = false;

  public constructor(
    private readonly ui: UIController
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
    this.updateHighlight();

    if (this.currentlyPlacing.Name !== this.targetOnClick?.Parent?.Name) return;
    this.currentlyPlacing.PrimaryPart!.Position = this.snap(getMouseWorldPosition());
  }

  private updateHighlight(): void {
    if (!this.currentHighlight) return;
    this.currentHighlight.FillColor = this.canPlace() ? this.canPlaceColor : this.cannotPlaceColor;
  }

  private snapCoord(n: number): number {
    return floor(n / this.gridSize + 0.5) * this.gridSize;
  }

  private snap({ X, Z }: Vector3): Vector3 {
    const rootPart = this.currentlyPlacing!.PrimaryPart!;
    return new Vector3(this.snapCoord(X), rootPart.Size.Y / 2, this.snapCoord(Z));
  }

  private canPlace(): boolean {
    if (!this.currentlyPlacing)
      return false;

    return this.inIslandBounds() && !this.isColliding();
  }

  private inIslandBounds(): boolean {
    const boundsPart = this.getBoundsPart();
    const [ island ] = this.getPartsInRegion(boundsPart);
    if (!island)
      return false;

    const region = new Region3(
      new Vector3(
        -island.Size.X / 2 + boundsPart.Size.X,
        island.Position.Y + island.Size.Y / 2,
        -island.Size.Z / 2 + boundsPart.Size.Z
      ),
      new Vector3(
        island.Size.X / 2 - boundsPart.Size.X,
        50,
        island.Size.Z / 2 - boundsPart.Size.Z
      )
    );

    const partsInIslandRegion = World.FindPartsInRegion3(region, island);
    return partsInIslandRegion.includes(boundsPart);
  }

  private isColliding(): boolean {
    const boundsPart = this.getBoundsPart();
    const partsInRegion = this.getPartsInRegion(boundsPart);
    return partsInRegion.size() > 1;
  }

  private getPartsInRegion(boundsPart: Part): BasePart[] {
    const region = toRegion3(boundsPart, 0.25);
    const partsInRegion = World.FindPartsInRegion3(region, boundsPart);
    return partsInRegion;
  }

  private getBoundsPart(): Part {
    return <Part>this.currentlyPlacing!
      .GetChildren()
      .find(i => Collection.HasTag(i, "BuildingBounds"));
  }

  public place(buildingName: string, category: Placable): void {
    this.toggleGrid(true);
    const buildingModel = <Model>Assets.WaitForChild(category).WaitForChild(buildingName).Clone();
    const rootPart = buildingModel.PrimaryPart!;
    const highlight = new Instance("Highlight", rootPart);
    highlight.OutlineTransparency = 1;
    highlight.Adornee = rootPart;

    this.currentlyPlacing = buildingModel;
    this.currentHighlight = highlight;
    
    const camPosition = World.Ignore.PlayerCamera.Position;
    rootPart.Position = this.snap(camPosition.add(new Vector3(12, 0, 12)));
    this.currentlyPlacing.Parent = World.CurrentCamera;
    this.updateHighlight();

    const placementConfirmation = <Frame & {
      Confirm: ImageButton;
      Cancel: ImageButton;
    }>this.ui.setPage("Main", "PlacementConfirmation");

    this.janitor.Add(this.currentlyPlacing);
    this.janitor.Add(() => this.ui.setPage("Main", "Main"));
    this.janitor.Add(placementConfirmation.Confirm.MouseButton1Click.Connect(async () => {
      if (!this.canPlace()) return;
      const position = this.currentlyPlacing!.PrimaryPart!.Position;
      const price = <number>this.currentlyPlacing!.GetAttribute("Price");
      incrementData("gold", -price);
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
    this.currentHighlight = undefined;
  }

  private toggleGrid(on: boolean) {    
    const enabledTransparency = 0.5
    const islands = <Island[]>World.Islands.GetChildren();
    for (const island of islands)
      island.Grid.Transparency = on ? enabledTransparency : 1;
  }
}
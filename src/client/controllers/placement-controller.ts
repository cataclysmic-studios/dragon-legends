import { Controller, Dependency, OnInit, OnRender } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";
import { Workspace as World } from "@rbxts/services";
import { Events } from "client/network";
import { Assets, BuildingCategory, Player } from "shared/util";
import { UIController } from "./ui-controller";

// TODO: grid align, move() method, green/red aura

@Controller()
export class PlacementController implements OnRender, OnInit {
  private readonly ui = Dependency<UIController>();
  private readonly janitor = new Janitor;
  private readonly mouse = Player.GetMouse();

  private currentlyPlacing?: Model;
  private targetOnClick?: Instance;
  private mouseDown = false;

  public isDragging(): boolean {
    return this.mouse.Target?.Parent?.Name === this.currentlyPlacing?.Name;
  };

  public onInit(): void | Promise<void> {
    // this.mouse.TargetFilter = World.CurrentCamera;
    this.mouse.Button1Up.Connect(() => this.mouseDown = false);
    this.mouse.Button1Down.Connect(() => {
      this.mouseDown = true;
      this.targetOnClick = this.mouse.Target;
    });
  }

  public onRender(dt: number): void {
    if (!this.currentlyPlacing || !this.mouseDown) return;
    
    const targetName = this.mouse.Target?.Parent?.Name;
    if (targetName !== this.currentlyPlacing.Name) return;
    if (targetName !== this.targetOnClick?.Parent?.Name) return;

    const position = this.mouse.Hit.Position;
    this.currentlyPlacing.PrimaryPart!.Position = position.sub(new Vector3(0, position.Y, 0));
  }

  public place(buildingName: string, category: BuildingCategory): void {
    this.toggleGrid(true);

    this.currentlyPlacing = Assets[category][buildingName].Clone();
    this.currentlyPlacing.Parent = World.CurrentCamera;

    const placementConfirmation = <Frame & {
      Confirm: ImageButton;
      Cancel: ImageButton;
    }>this.ui.getFrame("Main", "PlacementConfirmation");

    placementConfirmation.Visible = true;
    this.janitor.Add(this.currentlyPlacing);
    this.janitor.Add(() => placementConfirmation.Visible = false);

    this.janitor.Add(placementConfirmation.Confirm.MouseButton1Click.Once(() => {
      const position = this.currentlyPlacing!.PrimaryPart!.Position;
      Events.placeBuilding(buildingName, category, position);
      this.cancelPlacement();
    }));

    this.janitor.Add(placementConfirmation.Cancel.MouseButton1Click.Once(
      () => this.cancelPlacement()
    ));
  }

  public cancelPlacement(): void {
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
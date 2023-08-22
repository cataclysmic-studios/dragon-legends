import { Controller, OnInit, OnRender } from "@flamework/core";
import { StarterGui, Workspace as World } from "@rbxts/services";

import { UIController } from "./ui-controller";
import { MouseController } from "./mouse-controller";
import { BuildingPlacementController } from "./building-placement-controller";

@Controller()
export class CameraController implements OnInit, OnRender {
  private readonly cameraPart = World.Ignore.PlayerCamera;
  private readonly bounds = World.Ignore.CameraBounds;
  private readonly camera = World.CurrentCamera!;
  private zoomDirection = 0;
  private zoomPosition = 2;

  public constructor(
    private readonly ui: UIController,
    private readonly mouse: MouseController,
    private readonly building: BuildingPlacementController
  ) { }

  public onInit(): void {
    StarterGui.SetCoreGuiEnabled("All", false);
    this.camera.FieldOfView = 80;
    this.camera.CameraType = Enum.CameraType.Scriptable;

    const islandPosition = World.Islands.Main.Position;
    this.cameraPart.Position = islandPosition.add(new Vector3(0, 15 - islandPosition.Y, 0));
    this.mouse.onScroll(direction => {
      if (this.ui.current !== "Main") return;
      if (this.zoomPosition >= 8 && direction < 0) return;
      if (this.zoomPosition <= -15 && direction > 0) return;
      this.zoomDirection -= direction;
      this.zoomPosition -= direction;
    });
  }

  public onRender(dt: number): void {
    if (this.ui.current !== "Main") return;

    const { camera, cameraPart, bounds } = this;
    const { X: dx, Y: dy } = this.mouse.delta().div(16);
    const movementCorrection = CFrame.Angles(-math.rad(cameraPart.Orientation.X), 0, 0);
    const lookVector = cameraPart.CFrame
      .mul(movementCorrection).LookVector
      .mul(dy);
    const movedPosition = cameraPart.Position
      .add(this.cameraPart.CFrame.RightVector.mul(-dx))
      .add(lookVector);

    let { X: x, Z: z } = movedPosition;
    if (x >= bounds.Position.X + bounds.Size.X / 2)
      x = bounds.Size.X / 2;
    if (x <= bounds.Position.X - bounds.Size.X / 2)
      x = -bounds.Size.X / 2;
    if (z >= bounds.Position.Z + bounds.Size.Z / 2)
      z = bounds.Size.Z / 2;
    if (z <= bounds.Position.Z - bounds.Size.Z / 2)
      z = -bounds.Size.Z / 2;

    const notDragging = this.mouse.down && !this.building.isDragging();
    const mouseBehavior = notDragging ? Enum.MouseBehavior.LockCurrentPosition : Enum.MouseBehavior.Default;
    this.mouse.setBehavior(mouseBehavior);
    cameraPart.Position = new Vector3(x, movedPosition.Y, z)
      .add(cameraPart.CFrame.LookVector.mul(this.zoomDirection * 60 * dt));

    this.zoomDirection = 0;
    camera.CFrame = cameraPart.CFrame;
  }
}
import { Controller, OnInit, OnRender } from "@flamework/core";
import { StarterGui, Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { BuildingPlacementController } from "./building-placement-controller";
import { MouseController } from "./mouse-controller";

import { tween } from "shared/util";

// TODO: scroll to change FOV

@Controller()
export class CameraController implements OnInit, OnRender {
  private readonly cameraPart = World.Ignore.PlayerCamera;
  private readonly bounds = World.Ignore.CameraBounds;
  private readonly camera = World.CurrentCamera!;

  public constructor(
    private readonly building: BuildingPlacementController,
    private readonly mouse: MouseController
  ) { }

  public onInit(): void {
    StarterGui.SetCoreGuiEnabled("All", false);
    this.camera.CameraType = Enum.CameraType.Scriptable;
    this.mouse.onScroll(direction => this.zoom(direction));
  }

  private zoom(delta: number): void {
    const cam = World.CurrentCamera!;
    const min = 60, max = 85;
    tween(
      cam,
      new TweenInfoBuilder()
        .SetTime(0.3)
        .SetEasingStyle(Enum.EasingStyle.Sine),
      { FieldOfView: math.clamp(cam.FieldOfView + (delta * 4), min, max) }
    );
  }

  public onRender(): void {
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

    const mouseDown = this.mouse.down && !this.building.isDragging();
    const mouseBehavior = mouseDown ? Enum.MouseBehavior.LockCurrentPosition : Enum.MouseBehavior.Default;
    this.mouse.setBehavior(mouseBehavior);
    cameraPart.Position = new Vector3(x, movedPosition.Y, z);
    camera.CFrame = cameraPart.CFrame;
  }
}
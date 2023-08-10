import { Context } from "@rbxts/gamejoy";
import { StarterGui, UserInputService, Workspace as World } from "@rbxts/services";

import { Controller, Dependency, OnInit, OnRender } from "@flamework/core";
import { PlacementController } from "./placement-controller";
import { Action } from "@rbxts/gamejoy/out/Actions";

@Controller()
export class CameraController implements OnInit, OnRender {
  private readonly placement = Dependency<PlacementController>();
  private readonly cameraPart = World.Ignore.PlayerCamera;
  private readonly bounds = World.Ignore.CameraBounds;
  private readonly camera = World.CurrentCamera!;
  private readonly input = new Context({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  private mouseDown = false;

  public onInit(): void {
    StarterGui.SetCoreGuiEnabled("All", false);
    this.camera.CameraType = Enum.CameraType.Scriptable;

    const mb1 = new Action("MouseButton1");
    this.input.Bind(mb1, () => {
      if (this.placement.isDragging()) return;
      this.mouseDown = true;
    }).BindEvent("onRelease", mb1.Released, () => { this.mouseDown = false; });
  }

  public onRender(dt: number): void {
    const { camera, cameraPart, bounds } = this;
    const mouseDelta = UserInputService.GetMouseDelta().div(16);
    const movementCorrection = CFrame.Angles(-math.rad(cameraPart.Orientation.X), 0, 0);
    const lookVector = cameraPart.CFrame
      .mul(movementCorrection).LookVector
      .mul(mouseDelta.Y);
    const movedPosition = cameraPart.Position
      .add(this.cameraPart.CFrame.RightVector.mul(-mouseDelta.X))
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
  
    cameraPart.Position = new Vector3(x, movedPosition.Y, z);
    camera.CFrame = cameraPart.CFrame;
    UserInputService.MouseBehavior = this.mouseDown ? Enum.MouseBehavior.LockCurrentPosition : Enum.MouseBehavior.Default;
  }
}
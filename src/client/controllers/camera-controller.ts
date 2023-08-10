import { Context } from "@rbxts/gamejoy";
import { RunService as Runtime, StarterGui, UserInputService, Workspace as World } from "@rbxts/services";

import { Controller, Dependency, OnInit } from "@flamework/core";
import { PlacementController } from "./placement-controller";
import { Action } from "@rbxts/gamejoy/out/Actions";

@Controller()
export class CameraController implements OnInit {
  private mouseDown = false;
  private readonly placement = Dependency<PlacementController>();
  private readonly input = new Context({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  public onInit(): void {
    const cameraPart = World.PlayerCamera;
    const bounds = World.CameraBounds;
    const camera = World.CurrentCamera!;

    StarterGui.SetCoreGuiEnabled("All", false);
    camera.CameraType = Enum.CameraType.Scriptable;

    Runtime.RenderStepped.Connect(() => {
      if (this.placement.isPlacing()) return;

      const mouseDelta = UserInputService.GetMouseDelta().div(20);
      const movementCorrection = CFrame.Angles(-math.rad(cameraPart.Orientation.X), 0, 0)
      const lookVector = cameraPart.CFrame
        .mul(movementCorrection).LookVector
        .mul(mouseDelta.Y);
      const movedPosition = cameraPart.Position
        .add(cameraPart.CFrame.RightVector.mul(-mouseDelta.X))
        .add(lookVector);
    
      let { X: x, Z: z } = movedPosition;
      if (x > bounds.Position.X + bounds.Size.X / 2)
        x = bounds.Size.X / 2;
      if (x < bounds.Position.X - bounds.Size.X / 2)
        x = -bounds.Size.X / 2;
      if (z > bounds.Position.Z + bounds.Size.Z / 2)
        z = bounds.Size.Z / 2;
      if (z < bounds.Position.Z - bounds.Size.Z / 2)
        z = -bounds.Size.Z / 2;
    
      cameraPart.Position = new Vector3(x, movedPosition.Y, z);
      camera.CFrame = cameraPart.CFrame;
      UserInputService.MouseBehavior = this.mouseDown ? Enum.MouseBehavior.LockCurrentPosition : Enum.MouseBehavior.Default;
    });

    const mb1 = new Action("MouseButton1");
    this.input.Bind(mb1, () => { this.mouseDown = true })
      .BindEvent("onRelease", mb1.Released, () => { this.mouseDown = false });
  }
}
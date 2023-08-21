import { Controller, OnInit } from "@flamework/core";
import { CollectionService as Collection, HttpService as HTTP, UserInputService as UIS, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Axis, Union } from "@rbxts/gamejoy/out/Actions";
import { StrictMap } from "@rbxts/strict-map";
import StringUtils from "@rbxts/string-utils";

import { Player } from "shared/utilities/helpers";

export const enum MouseIcon {
  Default,
  Drag,
}

@Controller()
export class MouseController implements OnInit {
  public down = false;

  private readonly mouseRayDistance = 1000;
  private readonly playerMouse = Player.GetMouse();
  private readonly clickAction = new Union(["MouseButton1", "Touch"]);
  private readonly scrollAction = new Axis("MouseWheel");
  private readonly clickCallbacks = new StrictMap<string, Callback>;
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  public onInit(): void {
    // TODO: overhaul mobile controls
    // UIS.TouchPinch.Connect()
    this.input
      .Bind(this.clickAction, () => {
        this.down = true;
        this.clickCallbacks.forEach(callback => task.spawn(callback));
      })
      .BindEvent("onRelease", this.clickAction.Released, () => {
        this.down = false
      });
  }

  // returns a function that removes the listener
  public onClick(callback: Callback, predicate?: () => boolean): Callback {
    const id = HTTP.GenerateGUID();
    const disconnect = () => this.clickCallbacks.delete(id);
    this.clickCallbacks.set(id, () => {
      if (predicate && !predicate()) return;
      callback()
    });

    return disconnect;
  }

  public onScroll(callback: (direction: 1 | -1) => void) {
    this.input.Bind(this.scrollAction, () => callback(<1 | -1>-this.scrollAction.Position.Z));
  }

  public getWorldPosition(distance = this.mouseRayDistance): Vector3 {
    const { X, Y } = UIS.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);
    const raycastResult = this.createRay(distance);
    if (raycastResult)
      return raycastResult.Position;
    else
      return Origin.add(Direction.mul(distance));
  }

  public target(distance = this.mouseRayDistance): Maybe<BasePart> {
    return this.createRay(distance)?.Instance;
  }

  public delta(): Vector2 {
    return UIS.GetMouseDelta();
  }

  public setTargetFilter(filterInstance: Instance) {
    this.playerMouse.TargetFilter = filterInstance;
  }

  public setBehavior(behavior: Enum.MouseBehavior) {
    UIS.MouseBehavior = behavior;
  }

  public setIcon(icon: MouseIcon): void {
    return;
    const assetID = this.getMouseIcon(icon);
    this.playerMouse.Icon = assetID;
  }

  private createRay(distance: number): Maybe<RaycastResult> {
    const { X, Y } = UIS.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);
    const habitatDragons = Collection.GetTagged("Building")
      .filter((i): i is HabitatModel => StringUtils.endsWith(i.Name, "Habitat"))
      .map(habitat => habitat.Dragons);

    const raycastParams = new RaycastParamsBuilder()
      .SetIgnoreWater(true)
      .AddToFilter(World.Ignore, ...habitatDragons)
      .Build();

    return World.Raycast(Origin, Direction.mul(distance), raycastParams);
  }

  private getMouseIcon(icon: MouseIcon): string {
    switch (icon) {
      case MouseIcon.Default:
        return "rbxasset://SystemCursors/Arrow";
      case MouseIcon.Drag:
        return "rbxasset://SystemCursors/PointingHand";
    }
  }
}
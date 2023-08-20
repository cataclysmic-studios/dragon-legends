import { Controller, OnInit } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Axis, Union } from "@rbxts/gamejoy/out/Actions";
import { ContextOptions } from "@rbxts/gamejoy/out/Definitions/Types";
import { HttpService as HTTP, UserInputService } from "@rbxts/services";
import { StrictMap } from "@rbxts/strict-map";
import { Player } from "shared/utilities/helpers";

export const enum MouseIcon {
  Default,
  Drag,
}

@Controller()
export class MouseController implements OnInit {
  public down = false;

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
    this.input
      .Bind(this.clickAction, () => {
        this.down = true;
        this.clickCallbacks.forEach(callback => callback());
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

  public delta(): Vector2 {
    return UserInputService.GetMouseDelta();
  }

  public target(): Maybe<BasePart> {
    return this.playerMouse.Target;
  }

  public setTargetFilter(filterInstance: Instance) {
    this.playerMouse.TargetFilter = filterInstance;
  }

  public setBehavior(behavior: Enum.MouseBehavior) {
    UserInputService.MouseBehavior = behavior;
  }

  public setIcon(icon: MouseIcon): void {
    const assetID = this.getMouseIcon(icon);
    this.playerMouse.Icon = assetID;
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
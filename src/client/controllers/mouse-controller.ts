import { Controller, OnInit } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Union } from "@rbxts/gamejoy/out/Actions";
import { ContextOptions } from "@rbxts/gamejoy/out/Definitions/Types";
import { UserInputService } from "@rbxts/services";
import { Player } from "shared/util";

export const enum MouseIcon {
  Default,
  Drag,
}

@Controller()
export class MouseController implements OnInit {
  public down = false;

  private readonly playerMouse = Player.GetMouse();
  private readonly clickAction = new Union(["MouseButton1", "Touch"]);
  private readonly clickCallbacks: Callback[] = [];
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

  public delta(): Vector2 {
    return UserInputService.GetMouseDelta();
  }

  public target(): Maybe<BasePart> {
    return this.playerMouse.Target;
  }

  // returns a function that removes the listener
  public onClick(callback: Callback, predicate?: () => boolean): Callback {
    const disconnect = () => this.clickCallbacks.remove(this.clickCallbacks.indexOf(callback));
    this.clickCallbacks.push(() => {
      if (predicate && !predicate()) return;
      callback()
    });

    return disconnect;
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
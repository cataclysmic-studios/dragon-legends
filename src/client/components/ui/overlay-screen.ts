import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

@Component({ tag: "OverlayScreen" })
export class OverlayScreen extends BaseComponent<{}, ScreenGui> implements OnStart {
  public onStart(): void {
    this.instance.DisplayOrder += 1000;
  }
}
import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

interface Attributes {}

@Component({ tag: "BuildingBounds" })
export class BuildingBounds extends BaseComponent<Attributes, Part> implements OnStart {
  private readonly highlight = this.instance.FindFirstChildOfClass("Highlight") ?? new Instance("Highlight", this.instance);

  public onStart(): void {
    this.highlight.Enabled = false;
    this.highlight.Adornee = this.instance.Parent;
  }
}
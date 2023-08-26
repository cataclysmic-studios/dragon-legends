import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import StringUtils from "@rbxts/string-utils";

interface Attributes { }

@Component({ tag: "Viewport" })
export class Viewport extends BaseComponent<Attributes, ViewportFrame> implements OnStart {
  private fov = 30;

  public onStart(): void {
    if (this.instance.Parent?.IsA("Frame") && this.instance.Parent.Name === "ItemCard") {
      const title = <TextLabel>this.instance.Parent.WaitForChild("Title");
      if (StringUtils.endsWith(title.Text, "Habitat"))
        this.fov = 70;
    }


    const viewportCamera = new Instance("Camera");
    viewportCamera.CFrame = World.ViewportCamera.CFrame;
    viewportCamera.FieldOfView = this.fov;
    viewportCamera.Parent = this.instance;
    this.instance.CurrentCamera = viewportCamera;
    this.maid.GiveTask(viewportCamera);
  }
}
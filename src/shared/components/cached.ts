import { Component, BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import InstanceCache from "shared/classes/instance-cache";

interface Attributes {
  Size?: number;
}

@Component({ tag: "Cached" })
export class Cached extends BaseComponent<Attributes> {
  private readonly parent = this.instance.IsA("BasePart") ? World : this.instance.Parent;
  public readonly cache = new InstanceCache(this.instance, this.attributes.Size, undefined, this.parent);
}
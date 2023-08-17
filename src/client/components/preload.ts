import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { ContentProvider } from "@rbxts/services";

interface Attributes { }
type Preloadable = ImageLabel | ImageButton | Sound | Animation;

@Component({ tag: "Preload" })
export class Preload extends BaseComponent<Attributes, Preloadable> implements OnStart {
  public onStart(): void {
    task.spawn(() => ContentProvider.PreloadAsync([this.instance]));
  }
}
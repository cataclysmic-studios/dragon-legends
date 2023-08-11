import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

interface Attributes {}

@Component({ tag: "Timer" })
export class Timer extends BaseComponent<Attributes, Model> implements OnStart {
  public onStart(): void {
    // clone timer billboard gui, add it to maid
    // display remaining time, add connection to maid
  }
}
import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Events } from "client/network";
import { Assets, commaFormat, suffixedNumber } from "shared/util";
import { DataKey, DataValue, Dragon } from "shared/data-models";

interface Attributes {
  readonly DataKey: DataKey;
}

@Component({ tag: "DataLinkedText" })
export class DataLinkedText extends BaseComponent<Attributes, TextLabel> implements OnStart {
  public onStart(): void {
    Events.dataUpdate.connect((key, value) => this.onDataUpdate(key, value))
  }

  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== this.attributes.DataKey) return;
    
    switch (key) {
      case "level":
        this.instance.Text = commaFormat(<number>value);
        break;

      case "gold":
      case "diamonds":
      case "food":
        this.instance.Text = suffixedNumber(<number>value);
        break;
      case "dragons":
        const dragonCount = Assets.Dragons.GetChildren().filter(e => e.IsA("Model")).size();
        this.instance.Text = (<Dragon[]>value).size() + "/" + dragonCount;
        break;
    }
  }
}
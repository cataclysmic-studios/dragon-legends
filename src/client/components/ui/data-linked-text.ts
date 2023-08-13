import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue, Dragon } from "shared/data-models";
import { DataLinked } from "shared/hooks";
import { Assets, commaFormat, toSuffixedNumber } from "shared/util";

interface Attributes {
  readonly DataKey: DataKey;
}

@Component({ tag: "DataLinkedText" })
export class DataLinkedText extends BaseComponent<Attributes, TextLabel> implements DataLinked {
  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== this.attributes.DataKey) return;
    
    switch (key) {
      case "level":
        this.instance.Text = commaFormat(<number>value);
        break;

      case "gold":
      case "diamonds":
      case "food":
        this.instance.Text = toSuffixedNumber(<number>value);
        break;
      case "dragons":
        const dragonCount = Assets.Dragons.GetChildren().filter(e => e.IsA("Model")).size();
        this.instance.Text = (<Dragon[]>value).size() + "/" + dragonCount;
        break;
    }
  }
}
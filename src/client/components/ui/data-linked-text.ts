import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue, Dragon } from "shared/data-models";
import { Assets, commaFormat, toSuffixedNumber } from "shared/util";
import { Events } from "client/network";

const { dataUpdate } = Events;

interface Attributes {
  readonly DataKey: DataKey;
}

@Component({ tag: "DataLinkedText" })
export class DataLinkedText extends BaseComponent<Attributes, TextLabel> implements OnStart {
  public onStart(): void {
    this.maid.GiveTask(dataUpdate.connect((key, value) => this.onDataUpdate(key, value)));
  }

  private onDataUpdate(key: DataKey, value: DataValue): void {
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
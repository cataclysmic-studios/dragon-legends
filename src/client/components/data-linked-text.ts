import { OnInit } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Events } from "client/network";
import { assets, commaFormat, suffixedNumber } from "shared/util";

interface Attributes {
  readonly DataKey: string;
}

@Component({ tag: "DataLinkedText" })
export class DataLinked extends BaseComponent<Attributes, TextLabel> implements OnInit {
  public onInit(): void {
    Events.dataUpdate.connect((key, value) => this.onDataUpdate(key, value))
  }

  public onDataUpdate(key: string, value: unknown): void {
    switch (key) {
      case "level":
        this.instance.Text = commaFormat(<number>value);
        break;
      case "gold":
      case "diamonds":
        this.instance.Text = suffixedNumber(<number>value);
        break;
      case "dragons":
        this.instance.Text = (<unknown[]>value).size() + "/" + assets.Dragons.GetChildren().size();
        break;
    }
  }
}
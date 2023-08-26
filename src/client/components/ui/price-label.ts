import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue } from "shared/data-models/generic";
import { parseSuffixedNumber } from "shared/utilities/helpers";
import { DataLinked } from "client/hooks";
import { OnStart } from "@flamework/core";
import { Functions } from "client/network";
import { Exception } from "shared/exceptions";

const { getData } = Functions;

interface Attributes {
  Currency?: "gold" | "diamonds" | "food";
}

@Component({ tag: "PriceLabel" })
export class PriceLabel extends BaseComponent<Attributes, TextLabel & { UIStroke: UIStroke; }> implements DataLinked, OnStart {
  private readonly currency = this.attributes.Currency ?? "gold";

  public onStart(): void {
    this.maid.GiveTask(
      this.instance.GetPropertyChangedSignal("Text")
        .Connect(() => this.updateText())
    );
  }

  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== this.currency) return;
    this.updateText(<number>value);
  }

  private async updateText(value?: number) {
    value ??= <number>await getData(this.currency);
    const price = parseSuffixedNumber(this.instance.Text);
    if (!price)
      throw new Exception("SuffixedNumberParsing", `Failed to parse "${this.instance.Text}" into a number on ${this.instance.ClassName} "${this.instance.Name}"`);

    const canAfford = value >= price;
    this.instance.UIStroke.Color = canAfford ? new Color3 : Color3.fromHex("#a13434");
  }
}
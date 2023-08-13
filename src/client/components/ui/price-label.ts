import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue } from "shared/data-models/generic";
import { parseSuffixedNumber } from "shared/util";
import { DataLinked } from "client/hooks";

interface Attributes {
  Currency?: "gold" | "diamonds" | "food";
}

@Component({ tag: "PriceLabel" })
export class PriceLabel extends BaseComponent<Attributes, TextLabel & { UIStroke: UIStroke; }> implements DataLinked {
  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== (this.attributes.Currency ?? "gold")) return;
    const price = parseSuffixedNumber(this.instance.Text);
    const canAfford = <number>value >= price;
    this.instance.UIStroke.Color = canAfford ? new Color3 : Color3.fromHex("#a13434");
  }
}
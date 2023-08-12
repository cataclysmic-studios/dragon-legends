import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { parseSuffixedNumber } from "shared/util";
import { Events } from "client/network";

const { dataUpdate } = Events;

interface Attributes {
  Currency?: "gold" | "diamonds" | "food";
}

@Component({ tag: "PriceLabel" })
export class PriceLabel extends BaseComponent<Attributes, TextLabel & { UIStroke: UIStroke; }> implements OnStart {
  public onStart(): void {
    this.maid.GiveTask(
      dataUpdate.connect((key, value) => {
        if (key !== (this.attributes.Currency ?? "gold")) return;

        const price = parseSuffixedNumber(this.instance.Text);
        const canAfford = <number>value >= price;
        this.instance.UIStroke.Color = canAfford ? new Color3 : Color3.fromHex("#a13434");
      })
    );
  }
}
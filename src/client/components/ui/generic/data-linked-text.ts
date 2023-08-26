import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue } from "shared/data-models/generic";
import { Dragon } from "shared/data-models/dragons";
import { Assets, commaFormat, toSuffixedNumber } from "shared/utilities/helpers";
import { DataLinked } from "client/hooks";

function removeDuplicates(dragons: Dragon[]): Dragon[] {
  const seenNames = new Set<string>();
  const uniqueDragons: Dragon[] = [];

  for (const dragon of dragons)
    if (!seenNames.has(dragon.name)) {
      seenNames.add(dragon.name);
      uniqueDragons.push(dragon);
    }

  return uniqueDragons;
}

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
        const dragonsOwned = removeDuplicates(<Dragon[]>value).size();
        this.instance.Text = dragonsOwned + "/" + dragonCount;
        break;
    }
  }
}


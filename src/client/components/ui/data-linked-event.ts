import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue } from "shared/data-models";
import { DataLinked } from "client/hooks";

interface Attributes {
  readonly DataKey: DataKey;
}

@Component({ tag: "DataLinkedEvent" })
export class DataLinkedEvent extends BaseComponent<Attributes, BindableEvent> implements DataLinked {
  public onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== this.attributes.DataKey) return;
    this.instance.Fire(value);
  }
}
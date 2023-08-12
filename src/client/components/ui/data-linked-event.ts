import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { DataKey, DataValue } from "shared/data-models";
import { Events } from "client/network";

const { dataUpdate } = Events;

interface Attributes {
  readonly DataKey: DataKey;
}

@Component({ tag: "DataLinkedEvent" })
export class DataLinkedEvent extends BaseComponent<Attributes, BindableEvent> implements OnStart {
  public onStart(): void {
    this.maid.GiveTask(dataUpdate.connect((key, value) => this.onDataUpdate(key, value)));
  }

  private onDataUpdate(key: DataKey, value: DataValue): void {
    if (key !== this.attributes.DataKey) return;
    this.instance.Fire(value);
  }
}
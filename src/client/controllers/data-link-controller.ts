import { Controller, OnInit, Modding } from "@flamework/core";
import { DataLinked } from "client/hooks";
import { Events } from "client/network";

const { dataUpdate, initializeData } = Events;

@Controller()
export class DataLinkController implements OnInit {
  public onInit(): void {
    const listeners = new Set<DataLinked>();
    Modding.onListenerAdded<DataLinked>((object) => listeners.add(object));
    Modding.onListenerRemoved<DataLinked>((object) => listeners.delete(object));

    dataUpdate.connect((key, value) => {
      for (const listener of listeners)
        task.spawn(() => listener.onDataUpdate(key, value));
    });

    initializeData();
  }
}
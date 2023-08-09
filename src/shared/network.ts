import { Networking } from "@flamework/networking";
import { DataKey, DataValue } from "./util";

interface ServerEvents {
  initializeData(): void;
  setData(key: DataKey, value: DataValue): void;
}

interface ClientEvents {
  dataUpdate(key: DataKey, value: DataValue): void;
}

interface ServerFunctions {
  getData(key: DataKey): DataValue;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

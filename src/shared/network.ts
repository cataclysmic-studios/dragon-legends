import { Networking } from "@flamework/networking";
import { DataKey } from "./util";

interface ServerEvents {
  initializeData(): void;
  setData(key: DataKey, value: unknown): void;
}

interface ClientEvents {
  dataUpdate(key: DataKey, value: unknown): void;
}

interface ServerFunctions {
  getData(key: DataKey): unknown;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

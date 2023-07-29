import { Networking } from "@flamework/networking";

interface ServerEvents {
  initializeData(): void;
  setData(key: string, value: unknown): void;
}

interface ClientEvents {
  dataUpdate(key: string, value: unknown): void;
}

interface ServerFunctions {
  getData(key: string): unknown;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

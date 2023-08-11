import { Networking } from "@flamework/networking";
import { BuildingInfo, DataKey, DataValue } from "./data-models";
import { BuildingCategory } from "./util";

interface ServerEvents {
  initializeData(): void;
  dataInitialized(): void;
  setData(key: DataKey, value: DataValue): void;
  placeBuilding(buildingName: string, category: BuildingCategory, position: Vector3): void;
  buildingsLoaded(): void;
}

interface ClientEvents {
  dataUpdate(key: DataKey, value: DataValue): void;
}

interface ServerFunctions {
  getData(key: DataKey): DataValue;
  findBuilding(id: string): Maybe<BuildingInfo>;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

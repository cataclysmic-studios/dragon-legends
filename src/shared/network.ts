import { Networking } from "@flamework/networking";
import { Building, DataKey, DataValue, DragonInfo } from "./data-models";
import { Placable } from "./util";

interface ServerEvents {
  buildingsLoaded(): void;
  initializeData(): void;
  dataLoaded(): void;
  setData(key: DataKey, value: DataValue): void;
  placeBuilding(buildingName: string, category: Placable, position: Vector3, idOverride?: string): void;
  placeDragon(dragonData: DragonInfo, habitatID: string): void;
  updateTimers(): void;
}

interface ClientEvents {
  dataUpdate(key: DataKey, value: DataValue): void;
}

interface ServerFunctions {
  getData(key: DataKey): DataValue;
  findBuilding(id: string): Maybe<Building>;
  isTimerActive(buildingID: string): boolean;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

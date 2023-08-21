import { Networking } from "@flamework/networking";
import { DataKey, DataValue, GameDataModel } from "./data-models/generic";
import { Dragon, DragonInfo } from "./data-models/dragons";
import { Building } from "./data-models/buildings";
import { TimerInfo } from "./data-models/time";
import { Egg } from "./data-models/inventory";

import { Placable } from "./utilities/helpers";
import { NotificationType } from "./notification-type";

interface ServerEvents {
  playerChatted(message: string): void;

  initializeData(): void;
  dataLoaded(): void;
  setData(key: DataKey, value: DataValue): void;
  incrementData(key: ExtractKeys<GameDataModel, number>, amount?: number): void;

  placeBuilding(buildingName: string, category: Placable, position: Vector3, idOverride?: string): void;
  placeDragon(dragonData: DragonInfo, habitatID: string, idOverride?: string): void;
  updateTimers(): void;

  addDragonXP(dragonID: string): void;

  addEggToHatchery(egg: Egg, isLoaded?: boolean): void;
  removeEggFromHatchery(eggID: string): void;

  claimHabitatGold(habitatID: string): void;
}

interface ClientEvents {
  dataUpdate(key: DataKey, value: DataValue): void;
  buildingsLoaded(buildings: Building[]): void;
  timerFinished(timer: TimerInfo): void;
  addNotificationToButton(buttonName: string): void;
  dispatchNotification(message: string, notificationType?: NotificationType): void;
  replicateChatMessage(sender: string, message: string): void;
}

interface ServerFunctions {
  getData(key: DataKey): DataValue;
  getBuildingData(id: string): Maybe<Building>;
  getDragonData(id: string): Maybe<Dragon>;
  isTimerActive(buildingID: string): boolean;
  calculateXPUntilNextLevel(): number;
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();

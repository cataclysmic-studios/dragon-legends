import { UpgradableBuilding } from "./buildings";

export interface Habitat extends UpgradableBuilding {
  gold: number;
  dragonIDs: string[];
}
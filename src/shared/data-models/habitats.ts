import { Dragon } from "shared/data-models/dragons";
import { UpgradableBuilding } from "./buildings";

export interface Habitat extends UpgradableBuilding {
  gold: number;
  dragons: Dragon[];
}
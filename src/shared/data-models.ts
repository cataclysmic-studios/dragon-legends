interface MainData {
  timeInfo: TimeInfo;
  gold: number;
  diamonds: number;
  food: number;
  inventory: InventoryItem[]; // subject to change (obviously): eggs, perks, etc
  dragons: Dragon[];
  level: number;
  xp: number;
  buildings: Building[];
}

export type DataValue = MainData[DataKey];
export type DataKey = keyof MainData;
export const DataKeys: DataKey[] = [
	"timeInfo",
	"gold", "diamonds", "food",
	"inventory", "dragons",
	"level", "xp",
  "buildings"
];

class Unique {
  public constructor(
    public readonly id: string
  ) {}
}

export interface StorableVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Building extends Unique {
  readonly name: string;
  position: StorableVector3;
}

export interface Habitat extends Building {
  gold: number;
  dragons: Dragon[];
  level: number;
}

export class Buildings {
  public static isHabitat(building: Building): building is Habitat {
    return "dragons" in building && "gold" in building;
  }
}

export interface Timer {
  beganAt: number;
  length: number;
}

export interface BuildingTimer extends Timer {
  readonly buildingID: string;
}

export interface TimeInfo {
  lastDailyClaim?: number;
  lastOnline?: number;
  timers: BuildingTimer[];
}

export type CombatBadge = "None"
  | "Bronze I" | "Bronze II" | "Bronze III"
  | "Silver I" | "Silver II" | "Silver III"
  | "Gold I" | "Gold II" | "Gold III"
  | "Platinum I" | "Platinum II" | "Platinum III"
  | "Diamond I" | "Diamond II" | "Diamond III";

export type Rarity = "Basic" | "Rare" | "Epic" | "Legendary" | "Mythic";
export type Element =
	| "Inferno" | "Hydro" | "Geo" | "Cryo" // fire, water, earth, ice
	| "Electro" | "Bio" | "Necro" // storm, life, death
	| "Lunar" | "Solar" | "Myth" // dark, light
	| "Theo" | "Diabolo"; // god, devil

// Perks
const enum PerkType {
  Character,
  Combat
}

interface Perk {
  readonly name: string;
  readonly type: PerkType;
  readonly increment: number;
  readonly icon: string;
}
  
export interface Perks {
  character: Perk[];
  combat1: Perk[];
  combat2: Perk[];
}

export interface Ability {
  readonly element: Element | "Physical";
  level: number;
  damage: number;
}

export type DragonInfo = Pick<Dragon, "name" | "elements" | "rarity"> & {
  readonly hatchTime: string;
  readonly price: number;
};

export interface Dragon extends Unique {
  readonly name: string;
  readonly elements: Element[];
  readonly rarity: Rarity;
  damage: number;
  health: number;
  /** gold generated per minute */
  goldGenerationRate: number;
  power: number;
  empowerment: number;
  combatBadge: CombatBadge;
  perks: Perks;
  abilities: [Ability, Ability, Ability, Ability];
}

export abstract class InventoryItem {
  public abstract readonly name: string;
  public abstract readonly stackable: boolean;
}

export interface Egg extends InventoryItem {
  readonly hatchTime: number;
}
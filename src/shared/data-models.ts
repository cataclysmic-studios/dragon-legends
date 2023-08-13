export interface GameDataModel {
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

export type DataValue = GameDataModel[DataKey];
export type DataKey = keyof GameDataModel;
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

export interface UpgradableBuilding extends Building {
  level: number;
}

export interface Habitat extends UpgradableBuilding {
  gold: number;
  dragons: Dragon[];
}

export interface Hatchery extends UpgradableBuilding {
  eggs: Egg[];
}

export namespace Buildings {
  export function isHatchery(building: Building): building is Hatchery {
    return "eggs" in building;
  }

  export function isHabitat(building: Building): building is Habitat {
    return "dragons" in building && "gold" in building && isUpgradable(building);
  }

  export function isUpgradable(building: Building): building is UpgradableBuilding {
    return "level" in building;
  }
}

export const enum TimerType {
  Building = "Building",
  Hatch = "Hatch"
}

export interface TimerInfo extends Unique {
  readonly type: TimerType;
  beganAt: number;
  length: number;
}

export interface TimeInfo {
  lastDailyClaim?: number;
  lastOnline?: number;
  timers: TimerInfo[];
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

export namespace InventoryItems {
  export function isEgg(item: InventoryItem): item is Egg {
    return "hatchTime" in item;
  }
}

export interface InventoryItem {
  readonly name: string;
}

export interface Egg extends InventoryItem, Unique {
  readonly hatchTime: number;
}
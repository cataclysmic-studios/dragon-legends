interface MainData {
  timeInfo: TimeInfo;
  gold: number;
  diamonds: number;
  food: number;
  inventory: unknown[]; // subject to change (obviously)
  dragons: Dragon[];
  level: number;
  xp: number;
}

export type DataValue = MainData[DataKey];
export type DataKey = keyof MainData;

export interface TimeInfo {
  lastDailyClaim?: number;
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
	| "Gloom" | "Radiance" | "Myth" // dark, light
	| "Theo" | "Diabolo"; // god, devil

// Perks
abstract class Perk {
  public constructor(
    public readonly name: string,
    public readonly increment: number,
    public readonly icon: string
  ) {}
}
  
export class CharacterPerk extends Perk {}
export class CombatPerk extends Perk {}
export interface Perks {
  Character: CharacterPerk[];
  Combat1: CombatPerk[];
  Combat2: CombatPerk[];
}

export interface Ability {
  readonly element: Element | "Physical";
  level: number;
  damage: number;
}

export interface Dragon {
  readonly name: string;
  readonly elements: Element[];
  readonly rarity: Rarity;
  damage: number;
  health: number;
  goldGenerationRate: number;
  power: number;
  empowerment: number;
  combatBadge: CombatBadge;
  perks: Perks;
  abilities: [Ability, Ability, Ability, Ability];
}
import { toNearestFiveOrTen } from "shared/util";
import { Unique } from "./utility";

const { floor, max } = math;

export type CombatBadge = "None" |
  "Bronze I" | "Bronze II" | "Bronze III" |
  "Silver I" | "Silver II" | "Silver III" |
  "Gold I" | "Gold II" | "Gold III" |
  "Platinum I" | "Platinum II" | "Platinum III" |
  "Diamond I" | "Diamond II" | "Diamond III";

export type Rarity = "Basic" | "Rare" | "Epic" | "Legendary" | "Mythic";
export type Element = "Inferno" | "Hydro" | "Geo" | "Cryo" // fire, water, earth, ice
  |
  "Electro" | "Bio" | "Necro" // storm, life, death
  |
  "Lunar" | "Solar" | "Myth" // dark, light
  |
  "Theo" | "Diabolo"; // god, devil

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
  readonly index: number;
  readonly hatchTime: string;
  readonly price: number;
};

export interface Dragon extends Unique {
  readonly name: string;
  readonly elements: Element[];
  readonly rarity: Rarity;
  damage: number;
  health: number;
  xp: number;
  kills: number;
  /** gold generated per minute */
  goldGenerationRate: number;
  power: number;
  empowerment: number;
  combatBadge: CombatBadge;
  perks: Perks;
  abilities: [Ability, Ability, Ability, Ability];
}

export namespace Dragons {
  export function getLevel(dragon: Dragon): number {
    return floor(dragon.xp / 4) + 1;
  }

  export function getCurrentLevelXP(dragon: Dragon): number {
    return dragon.xp % 4;
  }

  export function getPower({ damage, health, xp, empowerment, goldGenerationRate, abilities }: Dragon): number {
    const totalAbilityLevel = abilities
      .map(a => a.level)
      .reduce((accum, cur) => accum + cur);

    return floor((xp + damage + health) * (empowerment + 1)) + goldGenerationRate + totalAbilityLevel;
  }

  export function calculateFeedingPrice(dragon: Dragon): number {
    const base = 5;
    const dampener = 2.5;
    const level = Dragons.getLevel(dragon);
    return max(toNearestFiveOrTen(base * 1.5 ** (level - 1) / dampener), base);
  }
}
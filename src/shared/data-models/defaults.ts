import { Dragon, Element, Rarity } from "./dragons";

export function createDefaultDragon(
  id: string,
  name: string,
  elements: Element[],
  rarity: Rarity,
  habitatID: string
): Dragon {

  return {
    id, name, elements, rarity, habitatID,
    damage: 100,
    health: 500,
    xp: 0, // 4 xp = 1 level
    kills: 0,
    goldGenerationRate: 10,
    empowerment: 0,
    power: 5,
    combatBadge: "None",

    perks: {
      character: [],
      combat1: [],
      combat2: []
    },

    abilities: [
      {
        element: "Physical",
        level: 1,
        damage: 100
      }, {
        element: "Inferno",
        level: 1,
        damage: 250
      }, {
        element: "Physical",
        level: 1,
        damage: 150
      }, {
        element: "Inferno",
        level: 1,
        damage: 150
      }
    ]
  };
}
import { TweenInfoBuilder } from "@rbxts/builders";
import { TweenService } from "@rbxts/services";
import { CombatBadge, Element, Rarity } from "../data-models/dragons";
import { Assets } from "./helpers";

export function updateEmpowermentStars(frame: Frame & { Star: ImageLabel }, empowerment: number): void {
  for (const star of frame.GetChildren())
    if (star.IsA("ImageLabel")) {
      const active = star.LayoutOrder <= empowerment;
      star.ImageColor3 = active ? Color3.fromRGB(255, 242, 57) : new Color3;
    }
}

export function updateCombatBadgeIcon(icon: ImageLabel, badge: CombatBadge): void {
  icon.Image = getCombatBadgeImage(badge);
}

export function updateRarityIcon(icon: ImageLabel & { Abbreviation: TextLabel; }, rarity: Rarity): void {
  const image = getRarityImage(rarity);
  const abbreviation = rarity.sub(1, 1);
  icon.Image = image;
  icon.Abbreviation.Text = abbreviation;
}

export function addElementsToFrame(frame: Frame, elements: Element[]): ImageLabel[] {
  const elementLabels: ImageLabel[] = [];
  let order = 1;

  for (const element of elements) {
    const banner = <ImageLabel>Assets.UI.ElementBanners.WaitForChild(element).Clone();
    banner.LayoutOrder = order;
    banner.Parent = frame;
    elementLabels.push(banner);
    order++;
  }

  return elementLabels;
}

export function tween<T extends Instance = Instance>(
  instance: T,
  tweenInfo: TweenInfo | TweenInfoBuilder,
  goal: Partial<ExtractMembers<T, Tweenable>>
): Tween {

  if ("Build" in tweenInfo)
    tweenInfo = tweenInfo.Build();

  const tween = TweenService.Create(instance, tweenInfo, goal);
  tween.Play();
  return tween;
}



function getCombatBadgeImage(badge: CombatBadge): string {
  switch (badge) {
    case "None": return "rbxassetid://14501660447";
    case "Bronze I": return "rbxassetid://00000";
    case "Bronze II": return "rbxassetid://00000";
    case "Bronze III": return "rbxassetid://00000";
    case "Silver I": return "rbxassetid://00000";
    case "Silver II": return "rbxassetid://00000";
    case "Silver III": return "rbxassetid://00000";
    case "Gold I": return "rbxassetid://00000";
    case "Gold II": return "rbxassetid://00000";
    case "Gold III": return "rbxassetid://00000";
    case "Platinum I": return "rbxassetid://00000";
    case "Platinum II": return "rbxassetid://00000";
    case "Platinum III": return "rbxassetid://00000";
    case "Diamond I": return "rbxassetid://00000";
    case "Diamond II": return "rbxassetid://00000";
    case "Diamond III": return "rbxassetid://00000";
  }
}

function getRarityImage(rarity: Rarity): string {
  switch (rarity) {
    case "Basic": return "rbxassetid://14399932656";
    case "Rare": return "rbxassetid://14400364792";
    case "Epic": return "rbxassetid://14400364959";
    case "Legendary": return "rbxassetid://14400365128";
    case "Mythic": return "rbxassetid://14233300725";
  }
}
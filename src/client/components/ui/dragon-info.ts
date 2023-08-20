import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

import { Dragon, Dragons } from "shared/data-models/dragons";
import { addElementsToFrame, newDragonModel, toSuffixedNumber, updateCombatBadgeIcon, updateRarityIcon } from "shared/util";
import { DragonInfoScreen } from "client/ui-types";
import { DataLinked } from "client/hooks";
import { Events, Functions } from "client/network";
import { DataKey } from "shared/data-models/generic";

const { incrementData, addDragonXP } = Events;
const { getData } = Functions;

interface Attributes {
  DragonID?: string;
}

@Component({ tag: "DragonInfo" })
export class DragonInfo extends BaseComponent<Attributes, DragonInfoScreen> implements DataLinked, OnStart {
  private readonly janitor = new Janitor;
  private readonly feedButton = this.instance.Viewport.Feed;

  private feedDebounce = false;
  private updateDebounce = false;

  public onStart(): void {
    this.instance.GetAttributeChangedSignal("DragonID")
      .Connect(() => this.update())
  }

  public async onDataUpdate(key: DataKey): Promise<void> {
    if (key !== "dragons") return;
    this.update();
  }

  private async update(): Promise<void> {
    if (this.updateDebounce) return;
    this.updateDebounce = true;
    task.delay(0.1, () => this.updateDebounce = false);

    const dragon = await this.getUpdatedDragon();
    if (!dragon) return;

    this.janitor.Cleanup();
    const feedingPrice = Dragons.calculateFeedingPrice(dragon);

    task.spawn(() => {
      const level = Dragons.getLevel(dragon);
      const dragonXP = Dragons.getCurrentLevelXP(dragon);
      this.instance.DragonName.Value.Text = dragon.name;
      this.instance.LevelContainer.Level.Text = tostring(level);
      this.instance.Viewport.XpBar.Progress.Size = UDim2.fromScale(dragonXP / 4, 1);

      const levelBasedStats = this.instance.ExtraInfo.Stats.LevelBasedStats.List;
      levelBasedStats.Income.Value.Text = toSuffixedNumber(dragon.goldGenerationRate) + "/min";
      levelBasedStats.Power.Value.Text = toSuffixedNumber(Dragons.getPower(dragon));

      this.feedButton.Container.Price.Text = toSuffixedNumber(feedingPrice);
      updateRarityIcon(this.instance.Info.Rarity, dragon.rarity);
      updateCombatBadgeIcon(this.instance.LevelContainer.CombatBadge, dragon.combatBadge);
      this.janitor.Add(newDragonModel(dragon.name, { parent: this.instance.Viewport }));
    });

    this.janitor.Add(() =>
      addElementsToFrame(this.instance.Info.Elements, dragon.elements)
        .forEach(e => e.Destroy())
    );

    this.janitor.Add(this.feedButton.MouseButton1Click.Connect(async () => {
      if (this.feedDebounce) return;
      this.feedDebounce = true;
      task.delay(0.75, () => this.feedDebounce = false);

      const food = <number>await getData("food");
      if (food < feedingPrice) return;
      incrementData("food", -feedingPrice);
      addDragonXP(dragon.id);
    }));
  }

  private async getUpdatedDragon(): Promise<Maybe<Dragon>> {
    const dragons = <Dragon[]>await getData("dragons");
    return dragons.find(d => d.id === this.attributes.DragonID);
  }
}
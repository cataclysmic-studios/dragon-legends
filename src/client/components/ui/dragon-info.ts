import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { DragonInfoScreen } from "client/ui-types";
import { Events, Functions } from "client/network";
import { Dragon } from "shared/data-models/dragons";
import { Janitor } from "@rbxts/janitor";
import { addElementsToFrame, calculateFeedingPrice, newDragonModel, toSuffixedNumber, updateRarityIcon } from "shared/util";

const { incrementData, updateDragonData } = Events;
const { getData } = Functions;

interface Attributes {
  DragonID?: string;
}

@Component({ tag: "DragonInfo" })
export class DragonInfo extends BaseComponent<Attributes, DragonInfoScreen> implements OnStart {
  private readonly janitor = new Janitor;
  private readonly feedButton = this.instance.Viewport.Feed;

  public onStart(): void {
    this.instance.GetAttributeChangedSignal("DragonID")
      .Connect(() => this.update())
  }

  private async update(): Promise<void> {
    if (!this.attributes.DragonID) return;
    this.janitor.Cleanup();

    const dragon = await this.getUpdatedDragon();
    const feedingPrice = calculateFeedingPrice(dragon);
    this.instance.DragonName.Value.Text = dragon.name;
    this.instance.Viewport.XpBar.Progress.Size = UDim2.fromScale(dragon.xp / 4, 1);
    this.feedButton.Container.Price.Text = toSuffixedNumber(feedingPrice);
    this.janitor.Add(addElementsToFrame(this.instance.Info.Elements, dragon.elements));
    this.janitor.Add(newDragonModel(dragon.name, { parent: this.instance.Viewport }));
    updateRarityIcon(this.instance.Info.Rarity, dragon.rarity);

    this.janitor.Add(this.feedButton.MouseButton1Click.Connect(async () => {
      const food = <number>await getData("food");
      if (food < feedingPrice) return;

      dragon.xp++;
      updateDragonData(dragon);
      incrementData("food", -feedingPrice);
    }))
  }

  private async getUpdatedDragon(): Promise<Dragon> {
    const dragons = <Dragon[]>await getData("dragons");
    return dragons.find(d => d.id === this.attributes.DragonID)!;
  }
}
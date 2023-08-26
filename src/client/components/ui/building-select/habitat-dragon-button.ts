import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

import { UIController } from "client/controllers/ui/ui-controller";
import { CacheController } from "client/controllers/cache-controller";

import { Dragon } from "shared/data-models/dragons";
import { Assets, newDragonModel } from "shared/utilities/helpers";
import InstanceCache from "shared/classes/instance-cache";

import { Functions } from "client/network";

const { getDragonData } = Functions;

@Component()
export class HabitatDragonButtonComponent extends BaseComponent<{}, HabitatDragonButton> implements OnStart {
  private readonly updateJanitor = new Janitor;

  public cache?: InstanceCache<HabitatDragonButton>;

  public constructor(
    private readonly ui: UIController,
    private readonly caches: CacheController
  ) { super(); }

  public onStart(): void {
    const cache = this.caches.get(Assets.UI.HabitatDragonButton);
    this.cache = cache;

    this.maid.GiveTask(this.updateJanitor);
    this.maid.GiveTask(() => cache.return(this.instance));
  }

  public async update(dragonID: string): Promise<void> {
    this.updateJanitor.Cleanup();

    const dragon = <Dragon>await getDragonData(dragonID);
    this.updateJanitor.Add(newDragonModel(dragon.name, {
      parent: this.instance.Viewport
    }));

    // this.instance.Boost
    this.instance.DragonName.Text = dragon.name;

    this.updateJanitor.Add(this.instance.MouseButton1Click.Connect(() => {
      this.ui.setScreenState("DragonInfo", { DragonID: dragonID });
      this.ui.open("DragonInfo");
    }));
  }
}
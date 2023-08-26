import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

import { DragonPlacementController } from "client/controllers/dragon-placement-controller";
import { CacheController } from "client/controllers/cache-controller";

import { Egg } from "shared/data-models/inventory";
import { Assets, newEggMesh } from "shared/utilities/helpers";
import InstanceCache from "shared/classes/instance-cache";

import { Events, Functions } from "client/network";

const { timerFinished, removeEggFromHatchery } = Events;
const { isTimerActive } = Functions;

@Component()
export class HatcheryEggButtonComponent extends BaseComponent<{}, HatcheryEggButton> implements OnStart {
  private readonly updateJanitor = new Janitor;

  public cache?: InstanceCache<HatcheryEggButton>;

  public constructor(
    private readonly dragon: DragonPlacementController,
    private readonly caches: CacheController
  ) { super(); }

  public onStart(): void {
    const cache = this.caches.get(Assets.UI.HatcheryEggButton);
    this.cache = cache;

    this.maid.GiveTask(this.updateJanitor);
    this.maid.GiveTask(() => cache.return(this.instance));
  }

  public async update(egg: Egg): Promise<void> {
    this.updateJanitor.Cleanup();
    this.updateJanitor.Add(newEggMesh(egg, {
      parent: this.instance.Viewport
    }));

    let eggTimerFinished = !await isTimerActive(egg.id);
    this.instance.Place.Visible = eggTimerFinished;

    this.updateJanitor.Add(this.instance.MouseButton1Click.Connect(async () => {
      if (!eggTimerFinished) return;

      const [dragonName] = egg.name.gsub(" Egg", "");
      const placed = await this.dragon.place(dragonName);
      if (placed) {
        removeEggFromHatchery(egg.id);
        this.cache!.return(this.instance);
      }
    }));

    this.updateJanitor.Add(timerFinished.connect(timer => {
      if (timer.id !== egg.id) return;
      eggTimerFinished = true;
      this.instance.Place.Visible = true;
    }));
  }
}
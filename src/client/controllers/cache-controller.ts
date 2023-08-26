import { Controller, OnInit } from "@flamework/core";
import { CollectionService as Collection, Workspace as World } from "@rbxts/services";
import { StrictMap } from "@rbxts/strict-map";
import InstanceCache from "shared/classes/instance-cache";

@Controller()
export class CacheController implements OnInit {
  private readonly caches = new StrictMap<Instance, InstanceCache>;

  public onInit(): void {
    const toCache = Collection.GetTagged("Cached");
    for (const instance of toCache)
      task.spawn(() => {
        const parent = instance.IsA("BasePart") ? World : instance.Parent;
        const cache = new InstanceCache(instance, instance.GetAttribute<Maybe<number>>("Size"), undefined, parent);
        this.caches.set(instance, cache);
      });
  }

  public get<T extends Instance = Instance>(instance: T): InstanceCache<T> {
    return <InstanceCache<T>>this.caches.mustGet(instance);
  }
}
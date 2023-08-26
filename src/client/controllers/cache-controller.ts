import { Controller } from "@flamework/core";
import { Components } from "@flamework/components";

import { Cached } from "shared/components/cached";
import { Exception } from "shared/exceptions";
import InstanceCache from "shared/classes/instance-cache";

@Controller()
export class CacheController {
  public constructor(
    private readonly components: Components
  ) { }

  public getCache<T extends Instance = Instance>(instance: Instance): InstanceCache<T> {
    const component = this.components.getComponent<Cached>(instance);
    if (!component)
      throw new Exception("MissingCachedComponent", `Instance "${instance.Name}" (${instance.GetFullName}) is missing the Cached component required to use CacheController#getCache()`);

    return <InstanceCache<T>>component.cache;
  }
}
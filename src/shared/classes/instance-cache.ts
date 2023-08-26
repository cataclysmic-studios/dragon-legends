import { Janitor } from "@rbxts/janitor";
import { Workspace as World } from "@rbxts/services";
import { Exception } from "shared/exceptions";

const FAR_AWAY = new CFrame(0, 10e8, 0);

export default class InstanceCache<T extends Instance = Instance> implements Destroyable {
  private readonly available: T[] = [];
  private readonly unavailable: T[] = [];
  private readonly janitor = new Janitor;

  public constructor(
    private readonly template: T,
    private readonly precreated = 5,
    private readonly expansionSize = 10,
    private parent: Instance = World
  ) {
    if (precreated <= 0)
      throw new Exception("InvalidPrecreatedAmount", "InstanceCache#precreated must be more than 0!");
    if (template.Archivable)
      warn("The template's Archivable property has been set to false, which prevents it from being cloned. It will temporarily be set to true.");

    const archivable = template.Archivable;
    template.Archivable = true;

    const newTemplate = template.Clone();
    template.Archivable = archivable;
    this.template = newTemplate;

    task.spawn(() => this.initializeTemplates());
    this.janitor.Add(this.template);
  }

  public setParent(newParent: Instance): void {
    if (!newParent.IsDescendantOf(World) && newParent !== World && this.template.IsA("BasePart"))
      throw new Exception("InvalidInstanceCacheParent", "Cache parent is not a descendant of Workspace! Parts should be kept where they will remain in the visible world.")

    const setParent = (i: T) => i.Parent = newParent;
    this.available.forEach(setParent);
    this.unavailable.forEach(setParent);
    this.parent = newParent;
  }

  public return(instance: T): void {
    const index = this.unavailable.indexOf(instance);
    if (index < 0)
      throw new Exception("ReturnedAvailableInstance", `Attempted to return instance "${instance.Name}" (${instance.GetFullName()}) to cache, but it is not currently in-use. Did you call this on the wrong instance?`);

    this.unavailable.remove(index);
    this.available.push(instance);
    this.moveAway(instance);
  }

  public retrieve(): T {
    if (this.available.size() === 0) {
      warn("No instances left in instance cache, creating new instances...");
      this.expand();
    }

    const instance = this.available.pop()!;
    this.unavailable.push(instance);

    return instance;
  }

  public destroy(): void {
    this.janitor.Destroy();
  }

  private initializeTemplates(): void {
    this.expand(this.precreated);
    this.template.Parent = undefined;
  }

  private expand(amount = this.expansionSize) {
    for (let i = 1; i <= amount; i++)
      this.available.push(this.newFromTemplate());
  }

  private newFromTemplate(): T {
    const instance = this.template.Clone();
    this.moveAway(instance);
    instance.Parent = this.parent;

    this.janitor.Add(instance);
    return instance;
  }

  private moveAway(instance: T) {
    if (instance.IsA("BasePart")) {
      instance.CFrame = FAR_AWAY;
      instance.Anchored = true;
    }
  }
}
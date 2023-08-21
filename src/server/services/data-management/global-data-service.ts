import { Service } from "@flamework/core";
import { DataStoreService as DataStore } from "@rbxts/services";
import { PurchaseAnalytics } from "shared/data-models/global";

type GlobalDataKey = "purchaseAnalytics";
type GlobalDataValue = PurchaseAnalytics;

@Service()
export class GlobalDataService {
  private readonly storage = DataStore.GetDataStore("GameData");

  public set(key: GlobalDataKey, value: Maybe<GlobalDataValue>) {
    this.storage.SetAsync(key, value);
  }

  public get<T extends unknown = unknown>(key: GlobalDataKey): Maybe<T> {
    const [data] = this.storage.GetAsync<T>(key);
    return data;
  }
}
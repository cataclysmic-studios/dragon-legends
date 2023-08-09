import { OnInit, Service } from "@flamework/core";
import DataStore2 from "@rbxts/datastore2";

import { Events, Functions } from "server/network";
import { TimeInfo } from "shared/data-models";
import { DataKey, DataKeys, DataValue } from "shared/util";

@Service()
export class DataService implements OnInit {
	public onInit(): void {
		DataStore2.Combine("DATA", ...DataKeys);

		Events.initializeData.connect((player) => this.setup(player));
		Events.setData.connect((player, key, value) => this.set(player, key, value));
		Functions.getData.setCallback((player, key) => this.get(player, key));
	}

	public increment(player: Player, key: DataKey, amount = 1): void {
		const value = this.get<number>(player, key) ?? 0;
		this.set(player, key, value + amount);
	}

	public get<T extends DataValue = DataValue>(player: Player, key: DataKey): T {
		const store = this.getStore<T>(player, key);
		return store.Get()!;
	}

	public set<T extends DataValue = DataValue>(player: Player, key: DataKey, value: T): void {
		const store = this.getStore<T>(player, key);
		store.Set(value);
	}

	private setup(player: Player): void {
    this.initialize(player, "gold", 100);
		this.initialize(player, "diamonds", 5);
		this.initialize(player, "food", 20);
		this.initialize(player, "level", 1);
		this.initialize(player, "xp", 0);
		this.initialize(player, "inventory", []);
		this.initialize(player, "dragons", []);
    this.initialize<TimeInfo>(player, "timeInfo", {
      lastDailyClaim: undefined
    });
	}

	private initialize<T extends DataValue = DataValue>(
		player: Player,
		key: DataKey,
		defaultValue: T
	): void {
		const store = this.getStore(player, key);
		this.sendToClient(player, key, store.Get(defaultValue));
		store.OnUpdate((value) => this.sendToClient(player, key, value));
	}

	private getStore<T extends DataValue = DataValue>(player: Player, key: DataKey): DataStore2<T> {
		return DataStore2<T>(key, player);
	}

	private sendToClient<T extends DataValue = DataValue>(
		player: Player,
		key: DataKey,
		value: T
	): void {
		Events.dataUpdate.fire(player, key, value);
	}
}

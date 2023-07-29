import { OnInit, Service } from "@flamework/core";
import DataStore2 from "@rbxts/datastore2";

import { Events, Functions } from "server/network";

interface TimeInfo {
  lastDailyClaim?: number;
}

@Service()
export class DataService implements OnInit {
	public onInit(): void {
		DataStore2.Combine("DATA", "timeInfo", "gold", "diamonds", "inventory");

		Events.initializeData.connect((player) => this.setup(player));
		Events.setData.connect((player, key, value) =>
			this.set(player, key, value)
		);

		Functions.getData.setCallback((player, key) => this.get(player, key));
	}

	public increment(player: Player, key: string, amount = 1): void {
		const value = this.get<number>(player, key) ?? 0;
		this.set(player, key, value + amount);
	}

	public get<T = unknown>(player: Player, key: string): Maybe<T> {
		const store = this.getStore<T>(player, key);
		return store.Get();
	}

	public set<T = unknown>(player: Player, key: string, value: T): void {
		const store = this.getStore<T>(player, key);
		store.Set(value);
	}

	private setup(player: Player): void {
    this.initialize(player, "gold", 100);
		this.initialize(player, "diamonds", 0);
		this.initialize(player, "inventory", []);
    this.initialize<TimeInfo>(player, "timeInfo", {
      lastDailyClaim: undefined
    });
	}

	private initialize<T = unknown>(
		player: Player,
		key: string,
		defaultValue?: T
	): void {
		const store = this.getStore(player, key);
		this.sendToClient(player, key, store.Get(defaultValue));
		store.OnUpdate((value) => this.sendToClient(player, key, value));
	}

	private getStore<T = unknown>(player: Player, key: string): DataStore2<T> {
		return DataStore2<T>(key, player);
	}

	private sendToClient<T = unknown>(
		player: Player,
		key: string,
		value: T
	): void {
		Events.dataUpdate.fire(player, key, value);
	}
}

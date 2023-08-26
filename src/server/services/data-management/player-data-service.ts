import { OnInit, Service } from "@flamework/core";
import DataStore2 from "@rbxts/datastore2";

import { DataKey, DataValue, DataKeys } from "shared/data-models/generic";
import { TimeInfo } from "shared/data-models/time";
import { Building, Hatchery } from "shared/data-models/buildings";
import { Assets, now, toStorableVector3 } from "shared/data-utilities/helpers";
import { Rank } from "shared/rank";
import Log from "shared/logger";

import { OnPlayerLeave } from "server/hooks";
import { Events, Functions } from "server/network";
import BanManager from "server/utilities/ban-manager";

const { initializeData, setData, incrementData, dataLoaded, dataUpdated } = Events;
const { getData, getRank } = Functions;

@Service({ loadOrder: 0 })
export class PlayerDataService implements OnInit, OnPlayerLeave {
	public onInit(): void {
		DataStore2.Combine("DATA", ...DataKeys);
		initializeData.connect((player) => this.setup(player));
		setData.connect((player, key, value) => this.set(player, key, value));
		incrementData.connect((player, key, amount) => this.increment(player, key, amount))
		getData.setCallback((player, key) => this.get(player, key));
	}

	public onPlayerLeave(player: Player): void {
		const timeInfo = this.get<TimeInfo>(player, "timeInfo");
		timeInfo.lastOnline = now();
		this.set(player, "timeInfo", timeInfo);
	}

	public increment(player: Player, key: DataKey, amount = 1): void {
		const value = this.get<number>(player, key);
		this.set(player, key, value + amount);
	}

	public get<T extends DataValue = DataValue>(player: Player, key: DataKey): T {
		const data = this.getDataStore<T>(player, key);
		return data.Get()!;
	}

	public set<T extends DataValue = DataValue>(player: Player, key: DataKey, value: T): void {
		task.spawn(async () => {
			const rank = await getRank(player);
			const maximum = this.getMaximum(key);
			if (typeOf(value) === "number" && rank === Rank.None && <number>value >= (maximum ?? math.huge))
				return BanManager.Ban(player.Name, "Exploiting: data exceeded maximum value");
		});

		const data = this.getDataStore<T>(player, key);
		data.Set(value);
	}

	private getMaximum(key: DataKey): Maybe<number> {
		switch (key) {
			case "level": return 250;

			case "xp":
			case "gold": return 1_000_000_000_000;

			case "diamonds":
			case "food": return 1_000_000_000;
		}
	}

	private setup(player: Player): void {
		this.initialize(player, "gold", 250);
		this.initialize(player, "diamonds", 5);
		this.initialize(player, "food", 20);
		this.initialize(player, "level", 1);
		this.initialize(player, "xp", 0);

		this.initialize(player, "inventory", []);
		this.initialize(player, "dragons", []);
		this.initialize<TimeInfo>(player, "timeInfo", {
			timers: []
		});

		this.initialize<Building[]>(player, "buildings", [
			<Hatchery>{
				id: "HATCHERY",
				name: "Hatchery",
				position: toStorableVector3(Assets.Buildings.Hatchery.PrimaryPart!.Position),
				level: 1,
				eggs: []
			}
		]);

		this.initialize(player, "purchaseHistory", []);

		Log.info("Initialized data");
		dataLoaded.predict(player);
	}

	private initialize<T extends DataValue = DataValue>(
		player: Player,
		key: DataKey,
		defaultValue: T
	): void {

		task.spawn(() => {
			const data = this.getDataStore(player, key);
			const value = data.Get(defaultValue);
			dataUpdated(player, key, value);
			data.OnUpdate((value) => dataUpdated(player, key, value));
		});
	}

	private getDataStore<T extends DataValue = DataValue>(player: Player, key: DataKey): DataStore2<T> {
		return DataStore2<T>("TEST20_" + key, player);
	}
}

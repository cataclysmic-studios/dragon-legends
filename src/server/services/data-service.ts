import { Modding, OnInit, Service } from "@flamework/core";
import { StrictMap } from "@rbxts/strict-map/out";
import DataStore2 from "@rbxts/datastore2";

import { Building, Hatchery, TimeInfo, DataKey, DataKeys, DataValue } from "shared/data-models";
import { OnPlayerJoin, OnPlayerLeave } from "server/hooks";
import { DataLinked } from "shared/hooks";
import { Assets, now, toStorableVector3 } from "shared/util";
import { Events, Functions } from "server/network";

const { initializeData, setData, dataLoaded } = Events;
const { getData, findBuilding } = Functions;

@Service()
export class DataService implements OnInit, OnPlayerLeave, OnPlayerJoin {
	private readonly updateListeners = new StrictMap<Player, Set<DataLinked>>();
	
	public onInit(): void {
		DataStore2.Combine("DATA", ...DataKeys);
		initializeData.connect((player) => this.setup(player));
		setData.connect((player, key, value) => this.set(player, key, value));
		getData.setCallback((player, key) => this.get(player, key));
		findBuilding.setCallback((player, id) => this.findBuilding(player, id));

    Modding.onListenerAdded<DataLinked>((object) => this.updateListeners.forEach(listeners => listeners.add(object)));
    Modding.onListenerRemoved<DataLinked>((object) => this.updateListeners.forEach(listeners => listeners.delete(object)));
	}

	public onPlayerJoin(player: Player): void {
		this.updateListeners.set(player, new Set<DataLinked>);
	}

	public onPlayerLeave(player: Player): void {
		const timeInfo = this.get<TimeInfo>(player, "timeInfo");
		timeInfo.lastOnline = now();
		this.set(player, "timeInfo", timeInfo);
		this.updateListeners.delete(player);
	}

	public addBuilding(player: Player, building: Building): void {
    const buildings = this.get<Building[]>(player, "buildings");
		buildings.push(building);
		this.set(player, "buildings", buildings);
  }

	public removeBuilding(player: Player, buildingID: string): void {
    const buildings = this.get<Building[]>(player, "buildings");
		const newBuildings = buildings.filter(b => b.id !== buildingID);
		this.set(player, "buildings", newBuildings);
  }

	public findBuilding<T extends Building = Building>(player: Player, buildingID: string): T extends Hatchery ? T : Maybe<T> {
		const buildings = this.get<Building[]>(player, "buildings");
		return <T extends Hatchery ? T : Maybe<T>>buildings.find(building => building.id === buildingID);
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

		dataLoaded.predict(player);
	}

	private initialize<T extends DataValue = DataValue>(
		player: Player,
		key: DataKey,
		defaultValue: T
	): void {

		const store = this.getStore(player, key);
		const value = store.Get(defaultValue);
		this.sendToClient(player, key, value);
		store.OnUpdate((value) => this.sendToClient(player, key, value));
	}

	private sendToClient<T extends DataValue = DataValue>(
		player: Player,
		key: DataKey,
		value: T
	): void {

		for (const listener of this.updateListeners.mustGet(player))
			task.spawn(() => listener.onDataUpdate(key, value));
	}

	private getStore<T extends DataValue = DataValue>(player: Player, key: DataKey): DataStore2<T> {
		return DataStore2<T>("TEST_" + key, player);
	}
}

import { Service, Modding, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

export interface OnPlayerLeave {
  onPlayerLeave(player: Player): void;
}

@Service()
export class PlayerLeaveService implements OnStart {
  public onStart(): void {
    const listeners = new Set<OnPlayerLeave>();
    Modding.onListenerAdded<OnPlayerLeave>((object) => listeners.add(object));
    Modding.onListenerRemoved<OnPlayerLeave>((object) => listeners.delete(object));

    Players.PlayerAdded.Connect((player) => {
        for (const listener of listeners)
          task.spawn(() => listener.onPlayerLeave(player));
    });

    for (const player of Players.GetPlayers())
      for (const listener of listeners)
        task.spawn(() => listener.onPlayerLeave(player));
  }
}
import { Controller } from "@flamework/core";
import SoundBuilder from "client/classes/sound-builder";

export type SoundName = keyof typeof SOUND_LIBRARY;

const SOUND_LIBRARY = <const>{
  ui_hover: new SoundBuilder(876939830),
  ui_click: new SoundBuilder(6052548458).setVolume(1)
};

@Controller()
export class SoundController {
  public play(soundName: SoundName): void {
    SOUND_LIBRARY[soundName].build().Play();
  }
}
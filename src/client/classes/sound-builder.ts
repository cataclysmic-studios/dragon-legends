import { SoundService } from "@rbxts/services";

export default class SoundBuilder {
  public readonly id: string;
  public timePosition = 0;
  public volume = 0.5;
  public pitch = 1;

  public constructor(id: number) {
    this.id = "rbxassetid://" + id;
  }

  public build(): Sound {
    const sound = new Instance("Sound");
    sound.SoundId = this.id;
    sound.Volume = this.volume;
    sound.PlaybackSpeed = this.pitch;
    sound.TimePosition = this.timePosition;
    sound.Parent = SoundService;
    sound.Ended.Once(() => sound.Destroy());
    return sound;
  }

  public beginsAt(timePosition: number): SoundBuilder {
    this.timePosition = timePosition;
    return this;
  }

  public setVolume(volume: number): SoundBuilder {
    this.volume = volume;
    return this;
  }

  public setPitch(pitch: number): SoundBuilder {
    this.pitch = pitch;
    return this;
  }
}
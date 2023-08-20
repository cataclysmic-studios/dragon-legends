import { Unique } from "./utility";

export const enum TimerType {
  Building = "Building",
  Hatch = "Hatch"
}

export interface TimerInfo extends Unique {
  readonly type: TimerType;
  beganAt: number;
  length: number;
}

export interface TimeInfo {
  lastDailyClaim?: number;
  lastOnline?: number;
  timers: TimerInfo[];
}

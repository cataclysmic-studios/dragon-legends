import { Players, ReplicatedFirst } from "@rbxts/services";
import { Exception } from "./exceptions";
import StringUtils from "@rbxts/string-utils";

const { floor, log } = math;
const suffixes = <const>["K", "M", "B", "T", "Q"];

export type BuildingCategory = "Decor" | "Buildings" | "Habitats"

export const Assets = ReplicatedFirst.Assets;
export const Player = Players.LocalPlayer;

const s = 1,
  m = 60,
  h = 3600,
  d = 86400,
  w = 604800;

const timePatterns = {
  s, second: s, seconds: s,
  m, minute: m, minutes: m,
  h, hour: h, hours: h,
  d, day: d, days: d,
  w, week: w, weeks: w
}

// Takes a remaining time string (e.g. 1d 5h 10s) and
// converts it to the amount of time it represents in seconds.
export function toSeconds(time: string): number {
  let seconds = 0;
  for (const [value, unit] of time.gmatch("(%d+)(%a)"))
    seconds += <number>value * timePatterns[<keyof typeof timePatterns>unit];

  return seconds;
}

// Takes a time in seconds (e.g. 310) and converts
// it to a remaining time string (e.g. 5m 10s)
export function toRemainingTime(seconds: number): string {
  const time = DateTime
    .fromUnixTimestamp(seconds)
    .ToUniversalTime();

  let remainingTime = "";
  if (time.Day === 0)
    remainingTime += "%dd ".format(time.Day);
  if (time.Hour === 0)
    remainingTime += "%dh ".format(time.Hour);
  if (time.Minute === 0)
    remainingTime += "%dm ".format(time.Minute);
  if (time.Second === 0)
    remainingTime += "%ds ".format(time.Second);

  return StringUtils.trim(remainingTime);
}

export function commaFormat(n: number | string): string {
  let formatted = tostring(n);
  const parts: string[] = [];

  while (formatted.size() > 3) {
    parts.insert(0, formatted.sub(-3));
    formatted = formatted.sub(1, -4);
  }

  parts.insert(0, formatted);
  return parts.join(",");
}

export function suffixedNumber(n: number): string {
  if (n < 100_000)
    return commaFormat(n);
  
  const index = floor(log(n, 1e3)) - 1;
  const divisor = 10 ** (index * 3);
  const [ baseNumber ] = "%.1f".format(n / divisor).gsub("%.?0+$", "");
  return commaFormat(baseNumber + (index < 0 ? "" : suffixes[index]));
}

export function parseSuffixedNumber(suffixed: string): number {
  const match = suffixed.match("^([0-9,.]+)([KMBT]?)$");
  if (!match)
    throw new Exception("InvalidSuffixedNumber", "Invalid suffixed number format");

  let [ numberPart ] = tostring(match[1]).gsub(",", "");
  const suffix = tostring(match[2]);

  if (suffix !== "" && suffix !== "nil") {
    const index = (<readonly string[]>suffixes).indexOf(suffix);
    if (index === -1)
      throw new Exception("InvalidNumberSuffix", "Invalid suffix in suffixed number");

    const multiplier = 10 ** ((index + 1) * 3);
    numberPart = tostring(tonumber(numberPart)! * multiplier);
  }

  return tonumber(numberPart)!;
}
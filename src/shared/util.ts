import { ReplicatedFirst } from "@rbxts/services";
import { Exception } from "./exceptions";

const { floor, log } = math;
const suffixes = <const>["K", "M", "B", "T", "Q"];

export const assets = ReplicatedFirst.Assets;

export type DataKey = ElementTypes<typeof DataKeys>;
export const DataKeys = <const>[
	"timeInfo",
	"gold", "diamonds", "food",
	"inventory", "dragons",
	"level", "xp"
];

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
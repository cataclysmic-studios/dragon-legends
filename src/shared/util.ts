import { ReplicatedFirst } from "@rbxts/services";

const { floor, log } = math;
const suffixes = <const>["K", "M", "B", "T", "Q"];

export const assets = ReplicatedFirst.Assets;

export function commaFormat(n: number | string): string {
  let formatted = tostring(n);
  const parts: string[] = [];

  while (formatted.size() > 3) {
    parts.insert(1, formatted.sub(-3));
    formatted = formatted.sub(1, -4);
  }

  parts.insert(1, formatted);
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
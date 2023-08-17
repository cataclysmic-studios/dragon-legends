interface ReprOptions {
  pretty: boolean;
  robloxFullName: boolean;
  robloxProperFullName: boolean;
  robloxClassName: boolean;
  tabs: boolean;
  semicolons: boolean;
  spaces: number;
  sortKeys: boolean;
}

declare function repr(value: unknown, options?: Partial<ReprOptions>): string;
export = repr;
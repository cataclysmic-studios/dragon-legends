// Typings for BanIt by Ty_Scripts

declare namespace BanManager {
  export function Ban(username: string, reason?: string): void;
  export function Unban(username: string): void;
  export function ServerBan(username: string, reason?: string): void;
  export function ServerUnban(username: string): void;
  export function TimedBan(username: string, num: string, numType: "minutes" | "hours" | "days"): void;
  export function TimedUnban(username: string): void;
  export function ShadowBan(username: string): void;
  export function ShadowUnban(username: string): void;
  export function GroupBan(groupID: string, reason?: string): void;
  export function GroupUnban(groupID: string): void;
  export function RankBan(username: string, roleName: string, reason?: string): void;
  export function RankUnban(username: string, roleName: string,): void;
  export function SetBannable(username: string): void;
  export function SetUnbannable(username: string): void;
}

export default BanManager;
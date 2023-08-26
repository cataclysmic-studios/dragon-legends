import { Controller, OnInit } from "@flamework/core";
import { Player } from "shared/data-utilities/helpers";
import { Rank } from "shared/rank";
import { Functions } from "client/network";

const { getRank } = Functions;

@Controller()
export class RankController implements OnInit {
  public readonly assigned = ({
    [44966864]: Rank.Dev, // me
    [101313060]: Rank.Dev, // collin
    [818658236]: Rank.Admin // forca
  })[Player.UserId] ?? Rank.None;

  public onInit(): void {
    getRank.setCallback(() => this.assigned);
  }
}
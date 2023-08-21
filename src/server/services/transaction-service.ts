import { OnInit, Service } from "@flamework/core";
import { MarketplaceService as Market, Players } from "@rbxts/services";

import { PlayerDataService } from "./data-management/player-data-service";
import { OnPlayerJoin } from "server/hooks";
import Log from "shared/logger";

const enum ProductIDs {
  DoubleGold = 239189441
}

@Service()
export class TransactionService implements OnInit, OnPlayerJoin {
  private readonly rewardHandlers: Record<number, (player: Player) => void> = {

  }

  public constructor(
    private readonly data: PlayerDataService
  ) { }

  public onInit(): void {
    Market.ProcessReceipt = ({ PlayerId, ProductId, PurchaseId }) => {
      const productKey = `${PlayerId}_${PurchaseId}`;
      const purchaseHistory = this.data.get<string[]>(Players.GetPlayerByUserId(PlayerId)!, "purchaseHistory");
      const alreadyPurchased = purchaseHistory.includes(productKey);
      if (alreadyPurchased)
        return Enum.ProductPurchaseDecision.PurchaseGranted;

      const player = Players.GetPlayerByUserId(PlayerId);
      let purchaseRecorded: Maybe<boolean> = true;
      if (!player)
        purchaseRecorded = undefined;

      let success = true;
      try {
        const grantReward = this.rewardHandlers[ProductId];
        if (player && grantReward)
          grantReward(player);
      } catch (e) {
        success = false;
        purchaseRecorded = undefined;
        warn(`Failed to process purchase for product ${ProductId}`);
      }

      if (!success || purchaseRecorded === undefined)
        return Enum.ProductPurchaseDecision.NotProcessedYet;
      else
        return Enum.ProductPurchaseDecision.PurchaseGranted;
    }
  }

  public onPlayerJoin(player: Player): void {
    Market.PromptGamePassPurchase(player, 239189441);
  }
}
import { OnInit, Service } from "@flamework/core";
import { MarketplaceService as Market, Players } from "@rbxts/services";

import { PlayerDataService } from "./data-management/player-data-service";
import { ProductType, PurchaseAnalyticsService } from "./purchase-analytics-service";
import { OnPlayerJoin } from "server/hooks";
import { getDevProducts } from "shared/data-utilities/helpers";

const enum ProductIDs {
  Gold5000 = 1620635951,
  Gold25000 = 1620636385,
  Gold75000 = 1620637847,
  Gold150K = 1620636384
}

@Service()
export class TransactionService implements OnInit, OnPlayerJoin {
  private readonly rewardHandlers: Record<number, (player: Player) => void> = {
    [ProductIDs.Gold5000]: player => this.data.increment(player, "gold", 5000),
    [ProductIDs.Gold25000]: player => this.data.increment(player, "gold", 25000),
    [ProductIDs.Gold75000]: player => this.data.increment(player, "gold", 75000),
    [ProductIDs.Gold150K]: player => this.data.increment(player, "gold", 150000)
  }

  public constructor(
    private readonly data: PlayerDataService,
    private readonly purchaseAnalytics: PurchaseAnalyticsService
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
        if (player) {
          const isDevProduct = getDevProducts().map<number>(p => p.ProductId).includes(ProductId);
          const productType = isDevProduct ? ProductType.DevProduct : ProductType.Gamepass;
          this.purchaseAnalytics.trackPurchase(player, ProductId, productType);
          if (grantReward)
            grantReward(player);
        }
      } catch (e) {
        success = false;
        purchaseRecorded = undefined;
        warn(`Failed to process purchase for product ${ProductId}: ${e}`);
      }

      if (!success || purchaseRecorded === undefined)
        return Enum.ProductPurchaseDecision.NotProcessedYet;
      else
        return Enum.ProductPurchaseDecision.PurchaseGranted;
    }
  }

  public onPlayerJoin(player: Player): void {
    // Market.PromptProductPurchase(player, 1620637847);
  }
}
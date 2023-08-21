import { Service, OnInit } from "@flamework/core";
import { MarketplaceService as Marketplace } from "@rbxts/services";

import { GlobalDataService } from "./global-data-service";
import { ApiService } from "../api-service";

import { PurchaseAnalytics } from "shared/data-models/global";
import { getPageContents, toSuffixedNumber } from "shared/utilities/helpers";
import { DiscordLogService, DiscordLogType } from "../discord-log-service";

const enum ProductType {
  Gamepass = "Gamepass",
  DevProduct = "Developer Product"
}

interface DevProductInfo {
  Description: string;
  PriceInRobux: number;
  ProductId: number;
  IconImageAssetId: number;
  Name: string;
}

@Service()
export class PurchaseAnalyticsService implements OnInit {
  public constructor(
    private readonly gameData: GlobalDataService,
    private readonly api: ApiService,
    private readonly discord: DiscordLogService
  ) { }

  public onInit(): void {
    if (!this.getData())
      this.initializeData();
  }

  public trackPurchase(player: Player, id: number, productType: ProductType): void {
    const analyticsData = this.getData();
    const countKey = ProductType.Gamepass ? "purchasedPassCount" : "purchasedProductCount";
    analyticsData[countKey][id] += 1;
    this.updateData(analyticsData);
    this.logPurchase(player, id, productType);
    print(this.getData());
  }

  private async logPurchase(player: Player, id: number, productType: ProductType): Promise<void> {
    let productName: string;
    let productPrice: number;
    if (productType === ProductType.Gamepass) {
      const gamepasses = await this.api.getGamepasses();
      const pass = gamepasses.find(pass => pass.id === id)!;
      productName = pass.name;
      productPrice = pass.price;
    } else {
      const products = this.getProducts();
      const product = products.find(product => product.ProductId === id)!;
      productName = product.Name;
      productPrice = product.PriceInRobux;
    }

    this.discord.log(player, DiscordLogType.Purchase, undefined, [
      {
        name: "Type",
        value: productType,
        inline: true
      }, {
        name: "Name",
        value: productName,
        inline: true
      }, {
        name: "Robux Earned",
        value: `R$${toSuffixedNumber(productPrice * 0.70)}`,
        inline: true
      }
    ]);
  }

  private async initializeData(): Promise<void> {
    const purchasedProductCount: Record<number, number> = {};
    const purchasedPassCount: Record<number, number> = {};
    const products = this.getProducts();
    const gamepasses = await this.api.getGamepasses();

    for (const product of products)
      purchasedProductCount[product.ProductId] = 0;
    for (const pass of gamepasses)
      purchasedPassCount[pass.id] = 0;

    this.updateData({
      purchasedPassCount,
      purchasedProductCount
    });
  }

  private getProducts(): DevProductInfo[] {
    return getPageContents(Marketplace.GetDeveloperProductsAsync());
  }

  private updateData(data: PurchaseAnalytics): void {
    this.gameData.set("purchaseAnalytics", data);
  }

  private getData(): PurchaseAnalytics {
    return this.gameData.get<PurchaseAnalytics>("purchaseAnalytics")!;
  }
}
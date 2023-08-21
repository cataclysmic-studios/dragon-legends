import { Service } from "@flamework/core";
import { HttpService as HTTP, RunService as Runtime } from "@rbxts/services";
import { HttpException } from "shared/exceptions";

interface DiscordEmbedField {
  readonly name: string;
  readonly value: string;
  readonly inline?: boolean;
}

export const enum DiscordLogType {
  Purchase = "Product Purchased"
}

@Service()
export class DiscordLogService {
  private readonly webhookURL = "https://hooks.hyra.io/api/webhooks/1143010077234704414/MBJE3yL5otNU_TL6XsA5l1nPMUBQjPR2FOlUt1WB1lFqVdva4f7VIxb9I27weiBAmrjY";

  public log(player: Player, logType: DiscordLogType, message?: string, fields?: DiscordEmbedField[]): void {
    // if (Runtime.IsStudio()) return;
    const data = HTTP.JSONEncode({
      WebhookURL: this.webhookURL,
      WebhookData: {
        username: "Dragon Legends Logger",
        embeds: [
          {
            title: logType,
            description: message,
            fields,
            timestamp: DateTime.now().ToIsoDate(),
            color: 0xe09f36,
            author: {
              name: player.Name,
              url: "https://www.roblox.com/users/" + player.UserId + "/profile"
            },
          }
        ]
      }
    });

    try {
      HTTP.PostAsync(this.webhookURL, data)
    } catch (e) {
      throw new HttpException(<string>e);
    }
  }
}
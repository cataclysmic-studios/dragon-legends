import { Service } from "@flamework/core";
import { HttpService as HTTP, RunService as Runtime } from "@rbxts/services";
import { HttpException } from "shared/exceptions";

export const enum LogType {
  Purchase = "Purchase"
}

@Service()
export class DiscordLogService {
  private readonly webhookURL = "https://hooks.hyra.io/api/webhooks/1143010077234704414/MBJE3yL5otNU_TL6XsA5l1nPMUBQjPR2FOlUt1WB1lFqVdva4f7VIxb9I27weiBAmrjY";

  public log(player: Player, message: string, logType: LogType): void {
    // if (Runtime.IsStudio()) return;
    const data = HTTP.JSONEncode({
      WebhookURL: this.webhookURL,
      WebhookData: {
        username: "Dragon Legends Logger",
        embeds: [
          {
            title: logType,
            description: message,
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

    xpcall(
      () => HTTP.PostAsync(this.webhookURL, data),
      e => { throw new HttpException(<string>e); }
    );
  }
}
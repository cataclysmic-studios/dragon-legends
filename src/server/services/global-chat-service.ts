import { Service, OnInit } from "@flamework/core";
import { LocalizationService as Localization, MessagingService as Messaging } from "@rbxts/services";
import { Events } from "server/network";

const { playerChatted } = Events;

interface GlobalChatMessage {
  readonly senderID: number;
  readonly content: string;
}

@Service()
export class GlobalChatService implements OnInit {
  public onInit(): void {
    playerChatted.connect((player, message) => this.send(player, message));
    Messaging.SubscribeAsync<GlobalChatMessage>("GLOBAL_CHAT", packet => {
      const message = packet.Data;
      const sentTimestamp = DateTime
        .fromUnixTimestamp(packet.Sent)
        .FormatLocalTime("LTS", Localization.SystemLocaleId);

      print("message sent: " + message.content, "\nat " + sentTimestamp);
    });
  }

  public send(player: Player, message: string): void {
    Messaging.PublishAsync<GlobalChatMessage>("GLOBAL_CHAT", {
      senderID: player.UserId,
      content: message
    });
  }
}
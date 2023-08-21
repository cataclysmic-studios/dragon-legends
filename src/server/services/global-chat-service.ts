import { Service, OnInit } from "@flamework/core";
import { LocalizationService as Localization, MessagingService as Messaging, Players, TextService as Text } from "@rbxts/services";
import { Events } from "server/network";

const { playerChatted, replicateChatMessage } = Events;

interface GlobalChatMessage {
  readonly sender: string;
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

      for (const player of Players.GetPlayers())
        task.spawn(() => {
          const filterResult = Text.FilterStringAsync(message.content, message.senderID, "PublicChat");
          const messageText = filterResult.GetChatForUserAsync(player.UserId);
          replicateChatMessage.fire(player, message.sender, messageText);
        });
    });
  }

  public send(player: Player, message: string): void {
    Messaging.PublishAsync<GlobalChatMessage>("GLOBAL_CHAT", {
      sender: player.DisplayName,
      senderID: player.UserId,
      content: message
    });
  }
}
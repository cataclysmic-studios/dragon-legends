import { Controller, OnInit } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";

import { UIController } from "./ui-controller";
import { ChatScreen } from "client/ui-types";
import { Events } from "client/network";
import StringUtils from "@rbxts/string-utils";

const { playerChatted, replicateChatMessage } = Events;

@Controller()
export class ChatController implements OnInit {
  private readonly chat;
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  })

  public constructor(
    ui: UIController
  ) {
    this.chat = ui.getScreen<ChatScreen>("Chat");
  }

  public onInit(): void {
    replicateChatMessage.connect((sender, message) => this.replicateMessage(sender, message));
    this.input.Bind("Return", () => {
      if (this.chat.Container.Input.IsFocused()) return;
      this.chat.Container.Input.CaptureFocus();
    });

    this.chat.Container.Input.FocusLost.Connect(enterPressed => {
      const message = StringUtils.trim(this.chat.Container.Input.Text);
      if (message === "") return;
      if (!enterPressed) return;

      this.chat.Container.Input.Text = "";
      playerChatted(message);
    });
  }

  private replicateMessage(sender: string, message: string): void {
    const label = new Instance("TextLabel");
    label.Name = "Message";
    label.BackgroundTransparency = 1;
    label.RichText = true;
    label.TextScaled = true;
    label.FontFace = new Font("rbxasset://fonts/families/SourceSansPro.json", Enum.FontWeight.Regular, Enum.FontStyle.Normal);
    label.Size = new UDim2(1, 0, 0.015, 0);
    label.TextColor3 = Color3.fromRGB(255, 255, 255);
    label.TextXAlignment = Enum.TextXAlignment.Left;
    label.Text = `<b><font color="#ffaa00">${sender}</font>:</b> ${StringUtils.trim(message)}`;
    label.Parent = this.chat.Container.Box.List;

    const sizeConstraint = new Instance("UISizeConstraint");
    sizeConstraint.MaxSize = new Vector2(math.huge, 24);
    sizeConstraint.MinSize = new Vector2(0, 24);
    sizeConstraint.Parent = label;
  }
}
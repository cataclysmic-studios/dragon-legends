interface Instance {
  GetAttribute<T extends Maybe<AttributeValue> = Maybe<AttributeValue>>(this: Instance, attribute: string): T
}

interface MessagingService {
  PublishAsync<Message extends unknown = unknown>(this: MessagingService, topic: string, message: Message): void;
  SubscribeAsync<Message extends unknown = unknown>(
    this: MessagingService,
    topic: string,
    callback: (message: { Data: Message; Sent: number }) => void,
  ): RBXScriptConnection;
}
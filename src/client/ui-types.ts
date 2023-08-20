export interface DebugStatsScreen extends ScreenGui {
  Info: Frame;
  Stats: Frame & {
    MemoryUsage: TextLabel;
    Incoming: TextLabel;
    Outgoing: TextLabel;
    Instances: TextLabel;
    ViewInfo: TextButton;
  };
}

export interface DragonInfoScreen extends ScreenGui {
  DragonName: ImageLabel & {
    Value: TextLabel;
  };
  Info: ImageLabel & {
    Elements: Frame;
    Rarity: ImageLabel & {
      Abbreviation: TextLabel;
    };
  };
  Viewport: ViewportFrame & {
    XpBar: Frame & {
      Progress: Frame;
    };
    Feed: TextButton & {
      Container: Frame & {
        Price: TextLabel;
        Icon: ImageLabel;
      };
    };
  };
  Background: ImageLabel;
  TopLeft: Frame & {
    Back: ImageButton & {
      Icon: ImageLabel;
    };
  };
  TopRight: Frame & {
    Close: ImageButton & {
      Icon: ImageLabel;
    };
  };
}

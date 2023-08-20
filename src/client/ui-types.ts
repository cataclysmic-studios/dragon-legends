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
    Value: TextLabel & {
      UIStroke: UIStroke;
    };
  };
  ExtraInfo: Frame & {
    Stats: Frame & {
      UIListLayout: UIListLayout;
      Frame: Frame & {
        Topbar: Frame & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          Edge: Frame;
          Title: TextLabel & {
            UIStroke: UIStroke;
          };
        };
        UIStroke: UIStroke;
        UICorner: UICorner;
      };
      BattleStats: Frame & {
        UICorner: UICorner;
        UIStroke: UIStroke;
        Topbar: Frame & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          Edge: Frame;
          List: Folder & {
            UIListLayout: UIListLayout;
          };
        };
        List: Folder & {
          UIListLayout: UIListLayout;
        };
      };
      LevelBasedStats: Frame & {
        UICorner: UICorner;
        UIStroke: UIStroke;
        Topbar: Frame & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          Edge: Frame;
          List: Folder & {
            UIListLayout: UIListLayout;
          };
        };
        List: Folder & {
          UIListLayout: UIListLayout;
          Income: Frame & {
            Value: TextLabel & {
              UICorner: UICorner;
              UIPadding: UIPadding;
            };
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
              Arrow: ImageLabel;
            };
          };
          Power: Frame & {
            Value: TextLabel & {
              UICorner: UICorner;
              UIPadding: UIPadding;
            };
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
            };
          };
        };
      };
    };
    UIGradient: UIGradient;
    SideButtons: Frame & {
      UICorner: UICorner;
      UIStroke: UIStroke;
      shadowHolder: Frame & {
        UICorner: UICorner;
        umbraShadow: ImageLabel;
        ambientShadow: ImageLabel;
        penumbraShadow: ImageLabel;
      };
      Container: Frame & {
        UIListLayout: UIListLayout;
        Stats: TextButton & {
          UIPadding: UIPadding;
          UICorner: UICorner;
          UIStroke: UIStroke;
          Icon: ImageLabel & {
            UIAspectRatioConstraint: UIAspectRatioConstraint;
          };
          UIGradient: UIGradient;
        };
        UIPadding: UIPadding;
      };
    };
    UICorner: UICorner;
    UIStroke: UIStroke;
    UIAspectRatioConstraint: UIAspectRatioConstraint;
    BottomButtons: Frame & {
      UIListLayout: UIListLayout;
      Sell: TextButton & {
        shadowHolder: Frame & {
          umbraShadow: ImageLabel;
          ambientShadow: ImageLabel;
          penumbraShadow: ImageLabel;
        };
        UIGradient: UIGradient;
        UICorner: UICorner;
        UIStroke: UIStroke;
        Price: TextLabel & {
          UIStroke: UIStroke;
        };
      };
      Find: TextButton & {
        shadowHolder: Frame & {
          umbraShadow: ImageLabel;
          ambientShadow: ImageLabel;
          penumbraShadow: ImageLabel;
        };
        UIGradient: UIGradient;
        UICorner: UICorner;
        UIStroke: UIStroke;
        Container: Frame & {
          Price: TextLabel & {
            UIStroke: UIStroke;
          };
          UIPadding: UIPadding;
          Icon: ImageLabel & {
            UIAspectRatioConstraint: UIAspectRatioConstraint;
          };
        };
      };
    };
  };
  Info: ImageLabel & {
    Rarity: ImageLabel & {
      UIAspectRatioConstraint: UIAspectRatioConstraint;
      Abbreviation: TextLabel & {
        UIStroke: UIStroke;
      };
    };
    Elements: Frame & {
      UIListLayout: UIListLayout;
    };
  };
  LevelContainer: Frame & {
    Empowerment: Frame & {
      UIListLayout: UIListLayout;
    };
    UIGradient: UIGradient;
    Title: TextLabel & {
      UIGradient: UIGradient;
      UIStroke: UIStroke;
    };
    UICorner: UICorner;
    Level: TextLabel & {
      UIGradient: UIGradient;
      UIStroke: UIStroke;
    };
    UIAspectRatioConstraint: UIAspectRatioConstraint;
    CombatBadge: ImageLabel & {
      UIAspectRatioConstraint: UIAspectRatioConstraint;
    };
  };
  Viewport: ViewportFrame & {
    XpBar: Frame & {
      UICorner: UICorner;
      UIStroke: UIStroke;
      Progress: Frame & {
        UICorner: UICorner;
        UIStroke: UIStroke;
        UIGradient: UIGradient;
      };
    };
    Feed: TextButton & {
      shadowHolder: Frame & {
        umbraShadow: ImageLabel;
        ambientShadow: ImageLabel;
        penumbraShadow: ImageLabel;
      };
      UIGradient: UIGradient;
      UICorner: UICorner;
      UIStroke: UIStroke;
      Container: Frame & {
        Price: TextLabel & {
          UIStroke: UIStroke;
        };
        Icon: ImageLabel & {
          UIAspectRatioConstraint: UIAspectRatioConstraint;
        };
        UIPadding: UIPadding;
      };
    };
    UIAspectRatioConstraint: UIAspectRatioConstraint;
  };
  Background: ImageLabel;
  TopLeft: Frame & {
    UIListLayout: UIListLayout;
    UIAspectRatioConstraint: UIAspectRatioConstraint;
    UIPadding: UIPadding;
    Back: ImageButton & {
      shadowHolder: Frame & {
        umbraShadow: ImageLabel;
        ambientShadow: ImageLabel;
        penumbraShadow: ImageLabel;
      };
      Icon: ImageLabel;
      UIAspectRatioConstraint: UIAspectRatioConstraint;
    };
  };
  TopRight: Frame & {
    UIListLayout: UIListLayout;
    UIAspectRatioConstraint: UIAspectRatioConstraint;
    UIPadding: UIPadding;
    Close: ImageButton & {
      shadowHolder: Frame & {
        umbraShadow: ImageLabel;
        ambientShadow: ImageLabel;
        penumbraShadow: ImageLabel;
      };
      Icon: ImageLabel;
      UIAspectRatioConstraint: UIAspectRatioConstraint;
    };
  };
}
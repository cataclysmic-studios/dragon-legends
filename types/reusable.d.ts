interface UpgradableMaximums {
	readonly level: number;
}

interface HabitatMaximums extends UpgradableMaximums {
	readonly gold: number[];
	readonly dragons: number[];
}

interface HatcheryMaximums extends UpgradableMaximums {
	readonly eggs: number[];
}

interface DragonbookCard extends TextButton {
	UIGradient: UIGradient;
	UICorner: UICorner;
	UIPadding: UIPadding;
	Shine: Frame & {
		UICorner: UICorner;
		UIGradient: UIGradient;
	};
	Viewport: ViewportFrame & {
		CombatBadge: ImageLabel & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
		};
		Empowerment: Frame & {
			UIListLayout: UIListLayout;
			Star: ImageLabel;
		};
		Elements: Frame & {
			UIListLayout: UIListLayout;
		};
		Rarity: ImageLabel & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			Abbreviation: TextLabel & {
				UIStroke: UIStroke;
			};
		};
		UICorner: UICorner;
		Level: Frame & {
			UICorner: UICorner;
			Value: TextLabel & {
				UIPadding: UIPadding;
				UIStroke: UIStroke;
			};
		};
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		UIStroke: UIStroke;
	};
	UIStroke: UIStroke & {
		UIGradient: UIGradient;
	};
	UIAspectRatioConstraint: UIAspectRatioConstraint;
	Title: TextLabel & {
		UIStroke: UIStroke;
	};
}

interface ItemCard extends Frame {
	UIPadding: UIPadding;
	UICorner: UICorner;
	UIAspectRatioConstraint: UIAspectRatioConstraint;
	Elements: Frame & {
		UIListLayout: UIListLayout;
	};
	Rarity: ImageLabel & {
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		Abbreviation: TextLabel & {
			UIStroke: UIStroke;
		};
	};
	Title: TextLabel & {
		UIStroke: UIStroke;
	};
	Pattern: ImageLabel & {
		UIGradient: UIGradient;
	};
	Viewport: ViewportFrame & {
		Camera: Camera;
		UIAspectRatioConstraint: UIAspectRatioConstraint;
	};
	UIStroke: UIStroke & {
		UIGradient: UIGradient;
	};
	Purchase: TextButton & {
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
	UIGradient: UIGradient;
}

interface InventoryCard extends Frame {
	Pattern: ImageLabel & {
		UIGradient: UIGradient;
	};
	Buttons: Frame & {
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
			Title: TextLabel & {
				UIStroke: UIStroke;
			};
		};
		Use: TextButton & {
			shadowHolder: Frame & {
				umbraShadow: ImageLabel;
				ambientShadow: ImageLabel;
				penumbraShadow: ImageLabel;
			};
			UIGradient: UIGradient;
			UICorner: UICorner;
			UIStroke: UIStroke;
			Title: TextLabel & {
				UIStroke: UIStroke;
			};
		};
	};
	UICorner: UICorner;
	UIAspectRatioConstraint: UIAspectRatioConstraint;
	UIGradient: UIGradient;
	Viewport: ViewportFrame & {
		Camera: Camera;
		UIAspectRatioConstraint: UIAspectRatioConstraint;
	};
	UIStroke: UIStroke & {
		UIGradient: UIGradient;
	};
	UIPadding: UIPadding;
	Title: TextLabel & {
		UIStroke: UIStroke;
	};
}

interface ModelWithMaximums extends Model {
	Maximums: ModuleScript;
}

interface HabitatModel extends ModelWithMaximums {
	Dragons: Folder;
	Highlight: Highlight;
	Base: Part;
}

interface HatcheryModel extends ModelWithMaximums {
	Base: UnionOperation;
	Eggs: Folder;
	EggPositions: Folder & {
		"1": Part;
		"2": Part;
	};
}
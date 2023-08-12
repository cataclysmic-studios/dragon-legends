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

interface HabitatModel extends Model {
	Dragons: Folder;
	Highlight: Highlight;
	Base: Part;
}

interface HatcheryModel extends Model {
	Base: UnionOperation;
	Eggs: Folder;
	EggPositions: Folder & {
		"1": Part;
		"2": Part;
	};
}
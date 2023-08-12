type ItemCard = Frame & {
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
};

type InventoryCard = Frame & {
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
		UIAspectRatioConstraint: UIAspectRatioConstraint;
	};
	UIStroke: UIStroke & {
		UIGradient: UIGradient;
	};
	UIPadding: UIPadding;
	Title: TextLabel & {
		UIStroke: UIStroke;
	};
};

type HabitatModel = Model & {
	Dragons: Folder;
	Highlight: Highlight;
	Base: Part;
};

interface ReplicatedFirst extends Instance {
	Assets: Folder & {
		Eggs: Folder;
		Dragons: Folder & {
			Types: ModuleScript;
			["Inferno Dragon"]: Model & {
				Data: ModuleScript;
				Root: MeshPart;
			};
		};
		Buildings: Folder;
		UI: Folder & {
			InventoryCard: InventoryCard;
			ItemCard: ItemCard;
			Timer: BillboardGui & {
				Icon: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
					UIGradient: UIGradient;
				};
				RemainingTime: TextLabel & {
					UIStroke: UIStroke;
				};
			};
			ElementBanners: Folder & {
				Necro: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Solar: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Bio: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Diabolo: ImageLabel & {
					UIGradient: UIGradient;
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Geo: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Electro: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Cryo: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Lunar: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Theo: ImageLabel & {
					UIGradient: UIGradient;
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Myth: ImageLabel & {
					UIGradient: UIGradient;
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Inferno: ImageLabel & {
					Icon: ImageLabel & {
						UIAspectRatioConstraint: UIAspectRatioConstraint;
					};
					UIGradient: UIGradient;
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
		};
		Habitats: Folder & {
			["Inferno Habitat"]: HabitatModel;
		};
		Decor: Folder;
	};
}

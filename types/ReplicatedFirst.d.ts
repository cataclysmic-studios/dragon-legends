interface ClaimGui extends BillboardGui {
	Button: TextButton;
	Icon: ImageLabel;
	Bubble: ImageLabel;
}

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
		Buildings: Folder & {
			Hatchery: HatcheryModel;
		};
		UI: Folder & {
			InventoryCard: InventoryCard;
			ItemCard: ItemCard;
			DragonbookCard: DragonbookCard;
			ClaimFood: ClaimGui;
			ClaimGold: ClaimGui;
			ClaimXP: ClaimGui;
			CollectedGold: BillboardGui & {
				Icon: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
				Amount: TextLabel & {
					UIStroke: UIStroke;
				};
			};
			HatcheryEggButton: ImageButton & {
				Viewport: ViewportFrame & {
					UICorner: UICorner;
				};
				Place: TextLabel & {
					UIStroke: UIStroke;
				};
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				shadowHolder: Frame & {
					umbraShadow: ImageLabel;
					ambientShadow: ImageLabel;
					penumbraShadow: ImageLabel;
				};
			};
			HabitatDragonButton: ImageButton & {
				DragonName: TextLabel & {
					UIStroke: UIStroke;
				};
				Viewport: ViewportFrame & {
					UICorner: UICorner;
				};
				Boost: TextLabel & {
					UIStroke: UIStroke;
				};
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				shadowHolder: Frame & {
					umbraShadow: ImageLabel;
					ambientShadow: ImageLabel;
					penumbraShadow: ImageLabel;
				};
			};
			ButtonNotification: Frame & {
				shadowHolder: Frame & {
					umbraShadow: ImageLabel;
					ambientShadow: ImageLabel;
					penumbraShadow: ImageLabel;
				};
				Amount: TextLabel & {
					UIStroke: UIStroke;
				};
				UIPadding: UIPadding;
				UICorner: UICorner;
				UIStroke: UIStroke;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				UIGradient: UIGradient;
			};
			Timer: BillboardGui & {
				Icon: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
					UIGradient: UIGradient;
				};
				RemainingTime: TextLabel & {
					UIStroke: UIStroke;
				};
			};
			TimerIcons: Folder & {
				Building: ImageLabel;
				Hatch: ImageLabel;
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

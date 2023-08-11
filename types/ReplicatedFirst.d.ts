interface ReplicatedFirst extends Instance {
	Assets: Folder & {
		Decor: Folder & { [name: string]: Model };
		Habitats: Folder & { [name: string]: Model };
		Buildings: Folder & { [name: string]: Model };
		Dragons: Folder & {
			[name: string]: Model & { Data: ModuleScript; };
		};
		UI: Folder & {
			Timer: BillboardGui & {
				Icon: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
					UIGradient: UIGradient;
				};
				RemainingTime: TextLabel & {
					UIStroke: UIStroke;
				};
			};			
			ItemCard: Frame & {
				UIPadding: UIPadding;
				UICorner: UICorner;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				Title: TextLabel & {
					UIStroke: UIStroke;
				};
				Pattern: ImageLabel & {
					UIGradient: UIGradient;
				};
				Viewport: ViewportFrame & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
					Camera: Camera;
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
		}
	};
}

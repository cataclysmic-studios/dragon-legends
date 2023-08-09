interface ReplicatedFirst extends Instance {
	Assets: Folder & {
		Decor: Folder & { [name: string]: Model };
		Habitats: Folder & { [name: string]: Model };
		Buildings: Folder & { [name: string]: Model };
		Dragons: Folder & {
			[name: string]: Model & { Data: ModuleScript; };
		};
	};
}

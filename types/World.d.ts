interface Island extends Part {
  Grid: Texture;
}

interface Workspace extends Model {
	Camera: Camera;
	CameraBounds: Part;
	PlayerCamera: Part;
	SpawnLocation: SpawnLocation & {
		Decal: Decal;
	};
	Buildings: Folder;
	Islands: Folder & {
		Main: Island;
	};
}

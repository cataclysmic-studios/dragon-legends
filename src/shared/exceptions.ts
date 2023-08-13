export class Exception {
	public constructor(
		name: string,
		public readonly message: string
	) {
		warn(`${name}Exception: ${message}`);
		// throw $error(`${name}Exception: ${message}`, (level ?? 0) + 1);
	}
}

export class MissingAttributeException extends Exception {
	public constructor(instance: Instance, attributeName: string) {
		super("MissingAttribute", `${instance.ClassName} "${instance.Name}" is missing attribute "${attributeName}"`);
	}
}

export class FlameworkIgnitionException extends Exception {
	public constructor(public readonly message: string) {
		super("FlameworkIgnition", message);
	}
}

export class MissingBuildingException extends Exception {
	public constructor(buildingID: string, message: string) {
		super("MissingBuilding", `${message} | Building ID ${buildingID}`);
	}
}

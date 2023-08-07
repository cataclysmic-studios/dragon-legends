// import { $error } from "rbxts-transform-debug";

export class Exception {
	public constructor(
		name: string,
		public readonly message: string,
		public readonly level?: number
	) {
		error(`${name}Exception: ${message}`, (level ?? 0) + 1);
		// throw $error(`${name}Exception: ${message}`, (level ?? 0) + 1);
	}
}

export class MissingAttributeException extends Exception {
	public constructor(instance: Instance, attributeName: string) {
		super("MissingAttribute", `Attribute "${attributeName}" is missing from ${instance.ClassName} "${instance.Name}"`);
	}
}

export class FlameworkIgnitionException extends Exception {
	public constructor(public readonly message: string) {
		super("FlameworkIgnition", message);
	}
}

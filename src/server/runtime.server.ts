import { Flamework } from "@flamework/core";
import { FlameworkIgnitionException } from "shared/exceptions";

try {
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.addPaths("src/shared/components");
	Flamework.ignite();
} catch (e) {
	new FlameworkIgnitionException(<string>e);
}

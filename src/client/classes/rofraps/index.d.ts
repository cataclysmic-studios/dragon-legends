/**
 * Credits to Pobammer
 * Refer to API: https://howmanysmall.github.io/RoFraps/api/RoFraps
 */

import Signal from "@rbxts/signal";

declare interface IRenderProps {
	ShowFramerate?: boolean;
	ShowMax?: boolean;
	ShowMin?: boolean;
	ShowOnePercentLow?: boolean;
	ShowPointOnePercentLow?: boolean;
	AnchorPoint?: Vector2;
	FontFace?: Font;
	Position?: UDim2;
	TextColor3?: Color3;
	TextSize?: number;
	TextStrokeColor3?: Color3;
}

interface RoFraps {
	readonly Framerate: number;
	readonly FramerateAverage: number;
	readonly OnePercentLow: number;
	readonly PointOnePercentLow: number;
	readonly DataUpdated: Signal;

	UpdateRate: number;

	IsRunning(): boolean;
	Start(): RoFraps;
	Stop(): RoFraps;
	MountGui(parent: Instance, Properties?: IRenderProps): RoFraps;
	UnmountGui(): RoFraps;
	Destroy(): void;
}

declare interface RoFrapsConstructor {
	new(UpdateRate?: number): RoFraps;
}

declare const RoFraps: RoFrapsConstructor;

export = RoFraps;
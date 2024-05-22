import type * as WPPType from "@wppconnect/wa-js";

declare global {
	interface Window {
		WPP: typeof WPPType;
	}
	const WPP: typeof WPPType;
}

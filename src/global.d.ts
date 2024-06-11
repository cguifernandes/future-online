import type * as WPPType from "@wppconnect/wa-js";
import type { Gatilho } from "./type/type";

declare global {
	interface Window {
		WPP: typeof WPPType;
		gatilhos: Gatilho[];
	}

	const myExtId: string;
	const WPP: typeof WPPType;
}

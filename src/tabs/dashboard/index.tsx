// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./dashboard";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";
import ErrorMessage from "../layout/error-message";

const init = async () => {
	const appContainer = document.createElement("div");
	if (!appContainer) throw new Error("Can not find AppContainer");
	const { expiredLicense } = await chrome.storage.sync.get("expiredLicense");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<>
			<Header />
			{expiredLicense ? (
				<ErrorMessage />
			) : (
				<>
					<Toaster />
					<Dashboard />
				</>
			)}
		</>,
	);
};

init();

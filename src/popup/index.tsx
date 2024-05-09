import React from "react";
import { createRoot } from "react-dom/client";
import "../assets/globals.css";
import Popup from "./popup";

const init = () => {
	const appContainer = document.createElement("div");
	if (!appContainer) throw new Error("Can not find AppContainer");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(<Popup />);
};

init();

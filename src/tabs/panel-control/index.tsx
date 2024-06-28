import { createRoot } from "react-dom/client";
import PanelControl from "./panel-control";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";

const init = async () => {
	const appContainer = document.createElement("div");
	if (!appContainer) throw new Error("Can not find AppContainer");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<>
			<Toaster />
			<Header />
			<PanelControl />
		</>,
	);
};

init();

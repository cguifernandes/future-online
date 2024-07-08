import { createRoot } from "react-dom/client";
import Dashboard from "./dashboard";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";

const init = async () => {
	const appContainer = document.createElement("div");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<>
			<Header />
			<Toaster />
			<Dashboard />
		</>,
	);
};

init();

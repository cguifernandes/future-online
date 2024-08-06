import { createRoot } from "react-dom/client";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";
import CRM from "./crm";

const init = async () => {
	const appContainer = document.createElement("div");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";

	root.render(
		<>
			<Header />
			<CRM />
			<Toaster />
		</>,
	);
};

init();

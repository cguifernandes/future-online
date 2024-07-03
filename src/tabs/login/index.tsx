import { createRoot } from "react-dom/client";
import Login from "./login";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";

const init = async () => {
	const appContainer = document.createElement("div");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<>
			<Toaster />
			<Login />
		</>,
	);
};

init();

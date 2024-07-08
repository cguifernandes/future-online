import { createRoot } from "react-dom/client";
import PanelControl from "./panel-control";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";
import ProtectedRoutes from "../layout/protected-routes";

const init = () => {
	const appContainer = document.createElement("div");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<ProtectedRoutes isUser>
			<Toaster />
			<Header />
			<PanelControl />
		</ProtectedRoutes>,
	);
};

init();

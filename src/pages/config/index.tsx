import { createRoot } from "react-dom/client";
import Config from "./config";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import ProtectedRoutes from "../layout/protected-routes";

const init = async () => {
	const appContainer = document.createElement("div");
	const searchParams = new URLSearchParams(window.location.search);
	const clientId = searchParams.get("client_id");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	root.render(
		<ProtectedRoutes clientId={clientId} isAuthor>
			<Toaster />
			<Config clientId={clientId} />
		</ProtectedRoutes>,
	);
};

init();

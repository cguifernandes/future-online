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
	const { account } = await chrome.storage.sync.get("account");

	root.render(
		<>
			<Header />
			{account ? (
				<>
					<Toaster />
					<Dashboard />
				</>
			) : (
				<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
					<div className="flex flex-col gap-y-px py-6">
						<h1 className="text-2xl font-bold">
							Você precisa estar logado para acessar essa página
						</h1>
						<span className="text-base">
							<button
								type="button"
								onClick={() =>
									chrome.runtime.sendMessage({
										target: "current",
										url: "/pages/login.html",
									})
								}
							>
								Ir para a página de login
							</button>
						</span>
					</div>
				</main>
			)}
		</>,
	);
};

init();

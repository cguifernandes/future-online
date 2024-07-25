import { createRoot } from "react-dom/client";
import Dashboard from "./dashboard";
import "../../assets/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "../layout/header";

const ErrorMessage = ({
	message,
	subMessage,
}: { message: string; subMessage?: string }) => {
	return (
		<>
			<Header />
			<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
				<div className="flex flex-col gap-y-px py-6">
					<h1 className="text-2xl font-bold">{message}</h1>
					{subMessage && (
						<span className="text-base text-black/7 0">{subMessage}</span>
					)}
				</div>
			</main>
		</>
	);
};

const init = async () => {
	const appContainer = document.createElement("div");

	document.body.appendChild(appContainer);
	const root = createRoot(appContainer);
	appContainer.id = "app";
	const { account } = await chrome.storage.sync.get();

	if (account?.licenseDate) {
		const licenseDate = new Date(account.licenseDate);
		const licenseDateWithoutTime = new Date(licenseDate);
		licenseDateWithoutTime.setHours(0, 0, 0, 0);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (licenseDateWithoutTime < today) {
			root.render(
				<ErrorMessage
					message="A data de licença já expirou"
					subMessage="Chame nosso suporte ou contrate um novo plano!"
				/>,
			);
			return;
		}
	}

	root.render(
		<>
			<Header />
			<Dashboard />
			<Toaster />
		</>,
	);
};

init();

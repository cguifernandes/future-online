import { useEffect, useState } from "react";
import Button from "../components/button";
import { url } from "../../utils/utils";
import { Client } from "../../type/type";
import ModalUser from "../modals/modal-user";

const Header = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [client, setClient] = useState<Client | null>();

	useEffect(() => {
		setIsLoading(true);
		const token = localStorage.getItem("token");

		fetch(`${url}/api/decoded-token?token=${token}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (response) => {
				const data = await response.json();
				setClient(data?.data);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<header className="flex justify-center bg-gray-800 h-24 flex-nowrap z-50 w-full">
			<nav className="w-full py-3 px-8 flex items-center justify-between max-w-7xl">
				<button
					type="button"
					onClick={() =>
						chrome.runtime.sendMessage({
							target: "current",
							url: "/pages/dashboard.html",
						})
					}
				>
					<img src="https://i.imgur.com/L43iCAC.png" alt="Logo" />
				</button>
				ARRUMAR ERRO UPLOAD IMAGE
				{isLoading || client === null ? (
					<span className="text-white text-base">Carregando...</span>
				) : client ? (
					<ModalUser client={client} />
				) : (
					<Button
						onClick={() =>
							chrome.runtime.sendMessage({
								target: "current",
								url: "/pages/login.html",
							})
						}
						className="!py-2 !px-3 w-32"
						theme="solid"
						type="button"
					>
						Login
					</Button>
				)}
			</nav>
		</header>
	);
};

export default Header;

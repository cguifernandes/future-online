import { ReactNode, useEffect } from "react";
import { url } from "../../utils/utils";

interface Props {
	children: ReactNode;
	isUser?: boolean;
	isAuthor?: boolean;
	clientId?: string;
}

const ProtectedRoutes = ({ children, clientId, isAuthor, isUser }: Props) => {
	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			chrome.runtime.sendMessage({
				target: "current",
				url: "/pages/login.html",
			});
			return;
		}

		fetch(`${url}/api/decoded-token?token=${token}`)
			.then(async (response) => {
				const data = await response.json();

				if (data.role === "user" && isUser) {
					chrome.runtime.sendMessage({
						target: "current",
						url: "/pages/login.html",
					});
					return;
				}

				if (isAuthor && clientId && data.data.id !== clientId) {
					chrome.runtime.sendMessage({
						target: "current",
						url: "/pages/dashboard.html",
					});
					return;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, [isAuthor, isUser, clientId]);

	return <>{children}</>;
};

export default ProtectedRoutes;

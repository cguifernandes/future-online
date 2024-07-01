import { ReactNode, useEffect } from "react";
import { url } from "../../utils/utils";

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			window.location.href = "/login.html";
			return;
		}

		fetch(`${url}/api/decoded-token?token=${token}`).then(async (response) => {
			const data = await response.json();

			if (data.role === "user") {
				window.location.href = "/login.html";
				return;
			}
		});
	}, []);

	return <>{children}</>;
};

export default ProtectedRoutes;

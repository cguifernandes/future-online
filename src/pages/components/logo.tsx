import { useEffect, useState } from "react";
import Spinner from "./spinner";
import clsx from "clsx";

type Props = {
	className?: string;
};

const Logo = ({ className }: Props) => {
	const [isLogin, setIsLogin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [logo, setLogo] = useState<string | null>(null);

	useEffect(() => {
		if (logo) return;

		chrome.storage.sync.get(null, (result) => {
			if (result.account?.isLogin) {
				setIsLogin(true);
				setLogo(result.account?.logo);
			} else {
				setIsLogin(false);
				setLogo(null);
			}
			setIsLoading(false);
		});
	}, [logo]);

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<img
			className={clsx("object-contain", className)}
			src={isLogin ? logo : "https://i.imgur.com/L43iCAC.png"}
			alt="Logo"
		/>
	);
};

export default Logo;

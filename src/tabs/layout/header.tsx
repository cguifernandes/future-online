import Button from "../components/button";

const Header = () => {
	return (
		<header className="flex justify-center bg-gray-800 h-24 flex-nowrap z-50 w-full">
			<nav className="w-full py-3 px-8 flex items-center justify-between max-w-7xl">
				<button
					type="button"
					onClick={() =>
						chrome.runtime.sendMessage({
							target: "current",
							url: "/dashboard.html",
						})
					}
				>
					<img src="https://i.imgur.com/L43iCAC.png" alt="Logo" />
				</button>
				ADICIONAR MIDDLEWARE NO BACKEND
				<Button
					onClick={() =>
						chrome.runtime.sendMessage({
							target: "current",
							url: "/login.html",
						})
					}
					className="!py-2 !px-3 w-32"
					theme="solid"
					type="button"
				>
					Login
				</Button>
			</nav>
		</header>
	);
};

export default Header;

const Header = () => {
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
			</nav>
		</header>
	);
};

export default Header;

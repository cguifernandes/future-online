import "./popup.css";
import Button from "../pages/components/button";

const Popup = () => {
	return (
		<div className="w-full h-full gap-y-2 flex-col flex items-center justify-center">
			<img src="https://i.imgur.com/L43iCAC.png" alt="Logo" />
			<div className="w-full h-px bg-white/50 my-2" />
			<Button
				type="button"
				className="bg-black/30"
				onClick={() =>
					chrome.runtime.sendMessage({
						target: "new",
						url: "/pages/dashboard.html",
					})
				}
			>
				Abrir dashboard
			</Button>
		</div>
	);
};

export default Popup;

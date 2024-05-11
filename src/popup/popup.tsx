import React from "react";
import "./popup.css";

const Popup = () => {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<button
				type="button"
				className="bg-gray-800 text-white text-base px-3 py-2 rounded-lg"
				onClick={() => chrome.tabs.create({ url: "/dashboard.html" })}
			>
				Abrir dashboard
			</button>
		</div>
	);
};

export default Popup;

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Popup from "./popup/popup";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(
	rootElement ? rootElement : document.createElement("div"),
);
root.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>,
);

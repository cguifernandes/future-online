import "./whatsapp.css";

function waitForElement(selector, callback) {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (document.querySelector(selector)) {
				observer.disconnect();
				callback();
				return;
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
}

window.onload = () => {
	if (window.location.href.includes("web.whatsapp.com")) {
		waitForElement("span.x1okw0bk", () => {
			const nav = document.querySelector("span.x1okw0bk");

			if (nav) {
				const pattern = nav.querySelector("div > span");
				const popupButton = document.createElement("button");
				const image = document.createElement("img");

				pattern.appendChild(popupButton);
				popupButton.appendChild(image);
				image.src = "https://i.ibb.co/c19SQLQ/icon.png";
				popupButton.className = "button-popup";

				popupButton.addEventListener("click", () => {
					const popup = document.createElement("div");

					pattern.appendChild(popup);
					pattern.classList.add("active");
					popup.className = "popup";
				});
			}
		});
	}
};

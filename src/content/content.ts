import "./whatsapp.css";

const waitForElement = (selector, callback) => {
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
};

const sendMessage = (message: string) => {
	const inputField = document.querySelectorAll("[contenteditable='true']");

	if (inputField[1] instanceof HTMLElement) {
		inputField[1].focus();
		document.execCommand("insertText", false, message);

		setTimeout(() => {
			inputField[1].dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
					keyCode: 13,
					code: "Enter",
				}),
			);
		}, 1);
	}
};

const loadButton = () => {
	const nav = document.querySelector("span.x1okw0bk");
	if (!nav) return;

	let visiblePopup = false;
	const span = nav.querySelector("div > span");
	if (!span) return;
	const button = document.createElement("button");
	const div = document.createElement("div");
	const image = document.createElement("img");

	span.appendChild(div);
	div.appendChild(button);
	button.appendChild(image);
	image.src = "https://i.imgur.com/XGfAVfk.png";
	button.className = "button-future-online";
	div.className = "pattern-future-online";

	const popup = document.createElement("div");
	const buttonPopup = document.createElement("button");
	const closeButton = document.createElement("button");

	div.appendChild(popup);
	popup.className = "popup-future-online";
	popup.appendChild(buttonPopup);
	popup.appendChild(closeButton);
	buttonPopup.className = "button-popup-future-online";
	buttonPopup.textContent = "Abrir dashboard";
	closeButton.className = "close-button-future-online";
	closeButton.textContent = "X";

	popup.style.display = "none";

	buttonPopup.addEventListener("click", () => {
		chrome.runtime.sendMessage({ action: "openDashboard" });
	});

	closeButton.addEventListener("click", () => {
		popup.style.display = "none";
		visiblePopup = false;
	});

	button.addEventListener("click", () => {
		if (visiblePopup) {
			popup.style.display = "none";
		} else {
			popup.style.display = "flex";
		}

		visiblePopup = !visiblePopup;
	});
};

const loadMessages = async (data: {
	itens: { content: string; title: string }[];
}) => {
	const main = document.getElementById("main");
	const footer = main.querySelector("footer");

	if (!footer.querySelector(".messages-future-online")) {
		const messages = document.createElement("button");
		const pattern = document.createElement("div");

		const buttons = data.itens.map((item) => {
			const button = document.createElement("button");
			button.textContent = item.title;
			button.className = "messages-future-online";
			button.addEventListener("click", () => {
				sendMessage(item.content);
			});
			return button;
		});

		for (const button of buttons) {
			pattern.appendChild(button);
		}

		pattern.className = "messages-pattern-future-online";
		footer.appendChild(pattern);
		pattern.appendChild(messages);
	}
};

window.onload = async () => {
	if (window.location.href.includes("web.whatsapp.com")) {
		waitForElement("span.x1okw0bk", () => {
			loadButton();
		});

		const data = (await chrome.storage.sync.get()) as {
			itens: { content: string; title: string }[];
		};

		if (data?.itens?.length !== 0) {
			waitForElement("div#main", () => {
				const observer = new MutationObserver((mutations) => {
					for (const mutation of mutations) {
						if (mutation.type === "childList") {
							loadMessages(data);
							return;
						}
					}
				});

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
			});
		}
	}
};

import { saveFile } from "../background/background";
import type { Message, Midia } from "../type/type";
import "./whatsapp.css";

const waitForElement = (selector, callback) => {
	const observer = new MutationObserver(() => {
		if (document.querySelector(selector)) {
			observer.disconnect();
			callback();
			return;
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
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

const loadItems = (
	titleText: string,
	items: Midia[] | Message[],
	pattern: HTMLDivElement,
	buttonClassName: string,
) => {
	const content = document.createElement("div");
	const title = document.createElement("h1");
	title.textContent = titleText;
	title.className = "item-title-future-online";
	content.appendChild(title);
	content.className = "item-content-future-online";

	for (const item of items) {
		const button = document.createElement("button");
		button.textContent = item.title;
		button.className = buttonClassName;
		button.addEventListener("click", async () => {
			if (item.type === "message") {
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: {
							content: item.content,
						},
					}),
				);
			}

			if (item.type === "midia" && item.image.url !== "" && item.image.url) {
				const fileName = new Date().getTime().toString();
				const file = await saveFile(item.image.url, fileName);

				window.dispatchEvent(
					new CustomEvent("sendFile", {
						detail: {
							file: file,
							subtitle: item.image.subtitle,
							type: item.image.type,
						},
					}),
				);
			}
		});
		content.appendChild(button);
	}

	content.className = "item-message-future-online";
	pattern.appendChild(content);
};

window.addEventListener("loadWpp", async () => {
	if (!window.location.href.includes("web.whatsapp.com")) return;

	const data = (await chrome.storage.sync.get()) as {
		messages: Message[];
		midias: Midia[];
	};

	waitForElement("span.x1okw0bk", () => {
		loadButton();
	});

	if (Object.keys(data).length === 0) return;

	waitForElement("div#main", () => {
		const observer = new MutationObserver(() => {
			const main = document.querySelector("div#main");
			const footer = main.querySelector("footer");

			const existingPattern = footer.querySelector(
				".item-pattern-future-online",
			);

			if (existingPattern) return;

			const pattern = document.createElement("div");
			pattern.className = "item-pattern-future-online";
			footer.appendChild(pattern);

			if (data.messages?.length > 0) {
				const messages: Message[] = data.messages.map((message) => ({
					type: "message",
					content: message.content,
					title: message.title,
				}));

				loadItems(
					"Mensagens",
					messages,
					pattern,
					"button-message-future-online",
				);
			}

			if (data.midias?.length > 0) {
				const midias: Midia[] = data.midias.map((midia) => ({
					type: "midia",
					title: midia.title,
					image: {
						url: midia.image.url,
						subtitle: midia.image.subtitle,
						preview: midia.image.preview,
						type: midia.image.type,
					},
				}));

				loadItems("Midias", midias, pattern, "button-midias-future-online");
			}

			return;
		});

		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
});

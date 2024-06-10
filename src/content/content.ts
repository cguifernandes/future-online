import { saveFile } from "../background/background";
import type { Mensagem, Midia, Funil, Gatilho } from "../type/type";
import { delay, getItemWithId } from "../utils/utils";
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

const loadItens = (
	titleText: string,
	itens: Midia[] | Mensagem[] | Funil[],
	pattern: HTMLDivElement,
	buttonClassName: string,
) => {
	const content = document.createElement("div");
	const title = document.createElement("h1");
	title.textContent = titleText;
	title.className = "item-title-future-online";
	content.appendChild(title);
	content.className = "item-content-future-online";

	for (const item of itens) {
		const button = document.createElement("button");
		button.textContent = item.title;
		button.className = buttonClassName;
		button.addEventListener("click", async () => {
			window.dispatchEvent(new CustomEvent("loadingStart"));

			if (item.type === "mensagens") {
				try {
					window.dispatchEvent(
						new CustomEvent("sendMessage", {
							detail: {
								content: item.content,
							},
						}),
					);
				} finally {
					window.dispatchEvent(new CustomEvent("loadingEnd"));
				}
			}

			if (item.type === "midias" && item.image.url !== "" && item.image.url) {
				try {
					const fileName = new Date().getTime().toString();
					const file = await saveFile(item.image.url, fileName);

					window.dispatchEvent(
						new CustomEvent("sendFile", {
							detail: {
								file: file,
								subtitle: item.image.subtitle,
							},
						}),
					);
				} finally {
					window.dispatchEvent(new CustomEvent("loadingEnd"));
				}
			}

			if (item.type === "funis") {
				window.dispatchEvent(new CustomEvent("loadingEnd"));
				if (!item.item) return;

				window.dispatchEvent(new CustomEvent("funilStart"));

				let setTimeoutCount = 0;

				const processItem = async () => {
					for (const i of item.item) {
						const delayInMilliseconds =
							(i.delay.minutes * 60 + i.delay.seconds) * 1000;
						let selectedItem = null;

						try {
							const selectedType = i.type
								.toLocaleLowerCase()
								.normalize("NFD")
								// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
								.replace(/[\u0300-\u036f]/g, "");

							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							const getStorageData = (key: string): Promise<any[]> => {
								return new Promise((resolve, reject) => {
									chrome.storage.sync.get(key, (result) => {
										if (chrome.runtime.lastError) {
											reject(chrome.runtime.lastError);
										} else {
											resolve(result[key] || []);
										}
									});
								});
							};

							const itens = await getStorageData(selectedType);
							selectedItem = itens.find((item) => item.id === i.selectedId);
						} finally {
							setTimeout(() => {
								if (selectedItem.type === "mensagens") {
									window.dispatchEvent(
										new CustomEvent("sendMessage", {
											detail: {
												content: selectedItem.content,
											},
										}),
									);
								}

								if (selectedItem.type === "midias") {
									const fileName = new Date().getTime().toString();
									saveFile(selectedItem.image.url, fileName).then((file) => {
										window.dispatchEvent(
											new CustomEvent("sendFile", {
												detail: {
													file: file,
													subtitle:
														selectedItem.type === "midias" &&
														selectedItem.image.subtitle,
												},
											}),
										);
									});
								}

								setTimeoutCount++;
								if (setTimeoutCount === item.item.length) {
									window.dispatchEvent(new CustomEvent("funilEnd"));
								}
							}, delayInMilliseconds);
						}

						await new Promise((resolve) =>
							setTimeout(resolve, delayInMilliseconds),
						);
					}
				};

				processItem();
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
		mensagens: Mensagem[];
		midias: Midia[];
		funis: Funil[];
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

			if (data.mensagens?.length > 0) {
				const mensagens: Mensagem[] = data.mensagens.map((message) => ({
					type: "mensagens",
					...message,
				}));

				loadItens(
					"Mensagens",
					mensagens,
					pattern,
					"button-message-future-online",
				);
			}

			if (data.midias?.length > 0) {
				const midias: Midia[] = data.midias.map((midia) => ({
					type: "midias",
					...midia,
				}));

				loadItens("Midias", midias, pattern, "button-midias-future-online");
			}

			if (data.funis?.length > 0) {
				const funis: Funil[] = data.funis.map((funil) => ({
					type: "funis",
					...funil,
				}));

				loadItens("Funis", funis, pattern, "button-funis-future-online");
			}

			return;
		});

		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
});

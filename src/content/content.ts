import { backgroundConvertUrlToFile } from "../background/background";
import type { Mensagem, Midia, Funil, Audio } from "../type/type";
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
		chrome.runtime.sendMessage({ target: "new", url: "/dashboard.html" });
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
	itens: Midia[] | Mensagem[] | Funil[] | Audio[],
	pattern: HTMLDivElement,
	buttonClassName: string,
	patternClassName: string,
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
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: {
							content: item.content,
						},
					}),
				);

				return;
			}

			if (item.type === "audios") {
				if (item.audio.url === "") {
					return window.dispatchEvent(new CustomEvent("loadingEnd"));
				}

				const fileName = new Date().getTime().toString();
				const file = await backgroundConvertUrlToFile(item.audio.url, fileName);

				window.dispatchEvent(
					new CustomEvent("sendFile", {
						detail: {
							file: file,
							type: "audios",
						},
					}),
				);

				return;
			}

			if (item.type === "midias") {
				if (item.file.url === "" && !item.file.url) {
					return window.dispatchEvent(new CustomEvent("loadingEnd"));
				}

				const fileName = item.file.url.split("/").pop();
				const file = await backgroundConvertUrlToFile(item.file.url, fileName);

				try {
					window.dispatchEvent(
						new CustomEvent("sendFile", {
							detail: {
								file,
								subtitle: item.file.subtitle,
							},
						}),
					);
				} finally {
					window.dispatchEvent(new CustomEvent("loadingEnd"));
				}

				return;
			}

			if (item.type === "funis") {
				window.dispatchEvent(new CustomEvent("loadingEnd"));
				if (!item.item) return;

				window.dispatchEvent(new CustomEvent("funilStart"));

				const loadStorageData = async (key) => {
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

				const itemTypes = [...new Set(item.item.map((i) => i?.type))];
				const storageData = {};

				for (const type of itemTypes) {
					const normalizedType = type
						.toLocaleLowerCase()
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, "");
					storageData[normalizedType] = await loadStorageData(normalizedType);
				}

				let setTimeoutCount = 0;

				const processItem = async () => {
					for (const i of item.item) {
						const delayInMilliseconds =
							(i.delay.minutes * 60 + i.delay.seconds) * 1000;
						let selectedItem = null;

						try {
							const selectedType = i?.type
								.toLocaleLowerCase()
								.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "");

							const itens = storageData[selectedType];
							selectedItem = itens.find((item) => item.id === i.selectedId);

							if (selectedItem?.type === "mensagens") {
								await new Promise((resolve) => {
									window.dispatchEvent(
										new CustomEvent("sendMessage", {
											detail: {
												content: selectedItem.content,
												delay: delayInMilliseconds,
											},
										}),
									);
									setTimeout(resolve, delayInMilliseconds);
								});
							} else if (selectedItem?.type === "midias") {
								const fileName = new Date().getTime().toString();

								await backgroundConvertUrlToFile(
									selectedItem.image.url,
									fileName,
								).then((file) => {
									return new Promise((resolve) => {
										window.dispatchEvent(
											new CustomEvent("sendFile", {
												detail: {
													file,
													subtitle:
														selectedItem.type === "midias" &&
														selectedItem.image.subtitle,
													delay: delayInMilliseconds,
												},
											}),
										);
										setTimeout(resolve, delayInMilliseconds);
									});
								});
							} else if (selectedItem?.type === "audios") {
								const fileName = new Date().getTime().toString();
								await backgroundConvertUrlToFile(
									selectedItem.audio.url,
									fileName,
								).then((file) => {
									return new Promise((resolve) => {
										window.dispatchEvent(
											new CustomEvent("sendFile", {
												detail: {
													file,
													delay: delayInMilliseconds,
													type: "audios",
												},
											}),
										);
										setTimeout(resolve, delayInMilliseconds);
									});
								});
							}

							setTimeoutCount++;
							if (setTimeoutCount === item.item.length) {
								window.dispatchEvent(new CustomEvent("funilEnd"));
							}
						} catch (error) {
							console.error("Erro ao processar o item:", error);
						}
					}
				};

				processItem();

				return;
			}
		});

		content.appendChild(button);
	}

	content.className = patternClassName;
	pattern.appendChild(content);
};

window.addEventListener("getGatilhosRequest", async () => {
	const data = await chrome.storage.sync.get("gatilhos");
	const event = new CustomEvent("getGatilhos", { detail: data.gatilhos });
	window.dispatchEvent(event);
});

window.addEventListener("getFunilWithIdRequest", async (e: CustomEvent) => {
	const { id } = e.detail;
	const data = await chrome.storage.sync.get("funis");
	const itemsOfType = data.funis as Funil[];

	let foundItem: Funil | null = null;
	if (itemsOfType && itemsOfType.length > 0) {
		foundItem = itemsOfType.find((item) => item.id === id) || null;
	}

	if (foundItem) {
		const selectedItemsPromises = foundItem.item.map(async (item) => {
			const delayInMilliseconds =
				(item.delay.minutes * 60 + item.delay.seconds) * 1000;

			const key = item.type
				.toLocaleLowerCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "");

			return new Promise<any>((resolve) => {
				chrome.storage.sync.get(key, (result) => {
					const found = result[key]?.find((i) => i.id === item.selectedId);
					resolve({ ...found, delay: delayInMilliseconds });
				});
			});
		});

		const selectedItems = await Promise.all(selectedItemsPromises);

		const responseEvent = new CustomEvent("getFunilWithIdResponse", {
			detail: { ...foundItem, selectedItems },
		});

		window.dispatchEvent(responseEvent);
	} else {
		const responseEvent = new CustomEvent("getFunilWithIdResponse", {
			detail: null,
		});

		window.dispatchEvent(responseEvent);
	}
});

window.addEventListener("loadWpp", async () => {
	if (!window.location.href.includes("web.whatsapp.com")) return;

	const data = (await chrome.storage.sync.get()) as {
		mensagens: Mensagem[];
		midias: Midia[];
		funis: Funil[];
		audios: Audio[];
	};

	waitForElement("span.x1okw0bk", () => {
		loadButton();
	});

	if (Object.keys(data).length === 0) return;

	const isNonEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;

	if (
		!data ||
		(!isNonEmptyArray(data.funis) &&
			!isNonEmptyArray(data.mensagens) &&
			!isNonEmptyArray(data.midias) &&
			!isNonEmptyArray(data.audios))
	) {
		return;
	}

	waitForElement("div#main", () => {
		const observer = new MutationObserver(() => {
			const main = document.querySelector("div#main");
			const footer = main.querySelector("footer");

			if (!main) return;

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
					"item-message-future-online message",
				);
			}

			if (data.audios?.length > 0) {
				const audios: Audio[] = data.audios.map((midia) => ({
					type: "audios",
					...midia,
				}));

				loadItens(
					"Áudios",
					audios,
					pattern,
					"button-audios-future-online",
					"item-message-future-online audios",
				);
			}

			if (data.midias?.length > 0) {
				const midias: Midia[] = data.midias.map((midia) => ({
					type: "midias",
					...midia,
				}));

				loadItens(
					"Mídias",
					midias,
					pattern,
					"button-midias-future-online",
					"item-message-future-online midias",
				);
			}

			if (data.funis?.length > 0) {
				const funis: Funil[] = data.funis.map((funil) => ({
					type: "funis",
					...funil,
				}));

				loadItens(
					"Funis",
					funis,
					pattern,
					"button-funis-future-online",
					"item-message-future-online funis",
				);
			}

			return;
		});

		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
});

window.addEventListener("saveFile", async (e: CustomEvent) => {
	const { path, fileName } = e.detail;

	try {
		const response = await fetch(path, {
			cache: "force-cache",
		});

		const blob = await response.blob();
		const filetype = blob.type;

		const file = new File([blob], fileName, { type: filetype });

		const responseEvent = new CustomEvent("saveFileResponse", {
			detail: file,
		});
		window.dispatchEvent(responseEvent);
	} catch (error) {
		console.error("Erro ao baixar o arquivo:", error);

		const responseEvent = new CustomEvent("saveFileResponse", {
			detail: null,
		});
		window.dispatchEvent(responseEvent);
	}
});

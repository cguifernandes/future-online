import { Audio, Funil, Mensagem, Midia } from "../type/type";
import "./whatsapp.css";

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
			if (!item.type) return;

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

window.addEventListener("loadingEnd", () => {
	const loadingContainer = document.querySelector(".loading-overlay.loading");
	if (!loadingContainer) return;

	loadingContainer.remove();
});

window.addEventListener("loadingStart", () => {
	const main = document.querySelector("div#main");
	const footer = main.querySelector("footer");
	const loadingContainer = footer.querySelector(".item-pattern-future-online");
	const existingOverlay = loadingContainer.querySelector(
		".loading-overlay.loading",
	);

	if (existingOverlay) return;
	if (!loadingContainer) return;

	const text = document.createElement("h2");
	const overlay = document.createElement("div");
	overlay.className = "loading-overlay loading";
	loadingContainer.appendChild(overlay);

	text.textContent = "Carregando...";
	text.className = "loading-text";
	overlay.appendChild(text);
});

window.addEventListener("funilStart", () => {
	const main = document.querySelector("div#main");
	const footer = main.querySelector("footer");
	const loadingContainer = footer.querySelector(".item-pattern-future-online");
	const existingOverlay = loadingContainer.querySelector(
		".loading-overlay.funil",
	);

	if (existingOverlay) return;
	if (!loadingContainer) return;

	const text = document.createElement("h2");
	const overlay = document.createElement("div");
	overlay.className = "loading-overlay funil";
	loadingContainer.appendChild(overlay);

	text.textContent = "Enviando funil...";
	text.className = "loading-text";
	overlay.appendChild(text);
});

window.addEventListener("funilEnd", () => {
	const loadingContainer = document.querySelector(".loading-overlay.funil");
	if (!loadingContainer) return;

	loadingContainer.remove();
});

const convertUrlToFile = async (path: string, fileName: string) => {
	try {
		const response = await fetch(path, {
			cache: "force-cache",
		});

		const blob = await response.blob();
		const filetype = blob.type;

		const file = new File([blob], fileName, { type: filetype });

		return file;
	} catch (error) {
		console.error("Erro ao baixar o arquivo:", error);
	}
};

export const createButton = (
	item: Mensagem | Funil | Audio | Midia,
	buttonClassName: string,
) => {
	const button = document.createElement("button");
	button.textContent = item.title;
	button.className = buttonClassName;
	button.id = item.id;

	button.addEventListener("click", async () => {
		window.dispatchEvent(new CustomEvent("loadingStart"));

		switch (item.type) {
			case "mensagens":
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: { content: item.content },
					}),
				);
				break;

			case "audios":
				await handleAudioItem(item);
				break;

			case "midias":
				await handleMediaItem(item);
				break;

			case "funis":
				await handleFunnelItem(item);
				break;
		}
	});

	return button;
};

export const loadItens = async ({
	itens,
	pattern,
	type,
}: {
	itens: Mensagem[] | Funil[] | Audio[] | Midia[];
	pattern: HTMLDivElement;
	type: "mensagens" | "audios" | "midias" | "funis" | "account" | "gatilhos";
}) => {
	if (type === "account" || type === "gatilhos") return;

	const existPattern = pattern.querySelector(
		`div.item-message-future-online.${type}`,
	);

	if (existPattern) return;

	const content = document.createElement("div");

	itens.forEach((item) => {
		const button = createButton(item, `button-${type}-future-online`);
		content.appendChild(button);
	});

	content.className = `item-message-future-online ${type}`;
	content.id = type;
	const order = ["mensagens", "midias", "audios", "funis"];

	let insertBeforeElement: HTMLElement | null = null;
	for (const t of order) {
		if (t === type) break;
		const element = pattern.querySelector(
			`div.item-message-future-online.${t}`,
		);
		if (element) insertBeforeElement = element.nextSibling as HTMLElement;
	}

	if (insertBeforeElement) {
		pattern.insertBefore(content, insertBeforeElement);
	} else {
		pattern.appendChild(content);
	}
};

export const handleAudioItem = async (item: Audio) => {
	if (item.audio?.url === "") {
		window.dispatchEvent(new CustomEvent("loadingEnd"));
		return;
	}

	const fileName = new Date().getTime().toString();
	const file = await convertUrlToFile(item.audio.url, fileName);

	window.dispatchEvent(
		new CustomEvent("sendFile", {
			detail: { file, type: "audios" },
		}),
	);
};

export const handleMediaItem = async (item: Midia) => {
	if (item.file?.url === "") {
		window.dispatchEvent(new CustomEvent("loadingEnd"));
		return;
	}

	const fileName = item.file.url.split("/").pop();
	const file = await convertUrlToFile(item.file.url, fileName);

	window.dispatchEvent(
		new CustomEvent("sendFile", {
			detail: { file, subtitle: item.file.subtitle },
		}),
	);
};

export const handleFunnelItem = async (item: Funil) => {
	window.dispatchEvent(new CustomEvent("loadingEnd"));
	if (!item.item || !Array.isArray(item.item)) return;

	window.dispatchEvent(new CustomEvent("funilStart"));

	const storageData = {};
	const itemTypes = [...new Set(item.item.map((i) => i?.type))];
	for (const type of itemTypes) {
		const normalizedType = normalizeType(type);
		storageData[normalizedType] = await loadStorageData(normalizedType);
	}

	let completedItems = 0;
	const totalItems = item.item.length;

	for (const i of item.item) {
		const delayInMilliseconds = (i.delay.minutes * 60 + i.delay.seconds) * 1000;
		let selectedItem: Midia | Mensagem | Audio = null;

		const selectedType = normalizeType(i.type);
		const itens = storageData[selectedType];
		selectedItem = itens.find((item) => item.id === i.selectedId);

		await new Promise<void>((resolve) => {
			setTimeout(async () => {
				await processSelectedItem(selectedItem, delayInMilliseconds);
				completedItems++;

				if (completedItems === totalItems) {
					window.dispatchEvent(new CustomEvent("funilEnd"));
				}

				resolve();
			}, delayInMilliseconds);
		});
	}
};

export const processSelectedItem = async (
	selectedItem: Mensagem | Audio | Midia,
	delay: number,
) => {
	switch (selectedItem.type) {
		case "mensagens": {
			await new Promise<void>((resolve) => {
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: {
							content: (selectedItem as Mensagem).content,
							delay,
						},
					}),
				);
				resolve();
			});
			break;
		}

		case "audios": {
			const fileName = new Date().getTime().toString();
			await convertUrlToFile((selectedItem as Audio).audio.url, fileName).then(
				(file) => {
					return new Promise<void>((resolve) => {
						window.dispatchEvent(
							new CustomEvent("sendFile", {
								detail: {
									file,
									type: "audios",
									delay,
								},
							}),
						);
						resolve();
					});
				},
			);
			break;
		}

		case "midias": {
			const fileName = new Date().getTime().toString();
			await convertUrlToFile((selectedItem as Midia).file.url, fileName).then(
				(file) => {
					return new Promise<void>((resolve) => {
						window.dispatchEvent(
							new CustomEvent("sendFile", {
								detail: {
									file,
									subtitle: (selectedItem as Midia).file.subtitle,
								},
							}),
						);
						resolve();
					});
				},
			);
			break;
		}
	}
};

export const loadStorageData = async (key: string): Promise<any[]> => {
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

export const createOrAppendPattern = (footer: HTMLElement): HTMLDivElement => {
	let pattern = footer.querySelector(
		".item-pattern-future-online",
	) as HTMLDivElement;

	if (!pattern) {
		pattern = document.createElement("div");
		pattern.className = "item-pattern-future-online";
		footer.appendChild(pattern);

		setTimeout(() => {
			if (!footer.contains(pattern)) {
				footer.appendChild(pattern);
			}
		}, 100);
	}

	return pattern;
};

export const changeMessageError = (message: string, subMessage?: string) => {
	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = footer.querySelector(".item-pattern-future-online");

	if (!pattern) return;

	const errorMessage = pattern.querySelector(".error-message-future-online");

	const primaryMessage = errorMessage.querySelector("span");
	primaryMessage.innerText = message;

	if (subMessage) {
		const secondMessage = errorMessage.querySelector("p");
		secondMessage.innerText = subMessage;
		return;
	}

	return;
};

export const showErrorMessage = (
	message: string,
	subMessage = "Chame nosso suporte ou contrate um novo plano!",
	pattern: Element | HTMLDivElement,
) => {
	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	if (pattern.querySelector(".error-message-future-online")) return;

	const messagePattern = document.createElement("div");
	messagePattern.className = "error-message-future-online";
	pattern.appendChild(messagePattern);

	const primaryMessage = document.createElement("span");
	primaryMessage.innerText = message;

	const secondMessage = document.createElement("p");
	secondMessage.innerText = subMessage;

	messagePattern.appendChild(primaryMessage);
	messagePattern.appendChild(secondMessage);
};

export const normalizeType = (type: string) => {
	return type
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
};

export const clearPatternContent = () => {
	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = footer.querySelector(".item-pattern-future-online");
	if (!pattern) return;

	const errorMessageDiv = pattern.querySelector(".error-message-future-online");
	if (!errorMessageDiv) {
		while (pattern.firstChild) {
			pattern.removeChild(pattern.firstChild);
		}
	}

	return;
};

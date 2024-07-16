import { Audio, Funil, Mensagem, Midia, StorageData } from "../type/type";
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
	titleText,
	type,
}: {
	titleText: string;
	itens: Mensagem[] | Funil[] | Audio[] | Midia[];
	pattern: HTMLDivElement;
	type: "mensagens" | "audios" | "midias" | "funis" | "account";
}) => {
	if (type === "account") return;

	const order = ["mensagens", "audios", "midias", "funis"];

	const existPattern = pattern.querySelector(
		`div.item-message-future-online.${type}`,
	);

	if (existPattern) return;

	const content = document.createElement("div");
	const title = document.createElement("h1");
	title.textContent = titleText;
	title.className = "item-title-future-online";
	content.appendChild(title);

	itens.forEach((item) => {
		const button = createButton(item, `button-${type}-future-online`);
		content.appendChild(button);
	});

	content.className = `item-message-future-online ${type}`;

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

export const showErrorMessage = () => {
	const pattern = document.querySelector(".item-pattern-future-online");
	if (!pattern) return;

	while (pattern.firstChild) {
		pattern.removeChild(pattern.firstChild);
	}

	const messagePattern = document.createElement("div");
	messagePattern.className = "error-message-future-online";

	const primaryMessage = document.createElement("span");
	primaryMessage.innerText = "Sua licença expirou 🥹";

	const secondMessage = document.createElement("p");
	secondMessage.innerText = "Chame nosso suporte ou contrate um novo plano!";

	pattern.appendChild(messagePattern);
	messagePattern.appendChild(primaryMessage);
	messagePattern.appendChild(secondMessage);
};

export const normalizeType = (type: string) => {
	return type
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
};

export const revalidateStorage = async (
	oldData: StorageData,
): Promise<{
	data: undefined | StorageData;
	passDifference: boolean;
}> => {
	const newData = (await chrome.storage.sync.get()) as StorageData;

	const differences = findDifferences(oldData, newData);
	if (differences.length === 0)
		return {
			data: undefined,
			passDifference: false,
		};

	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = footer.querySelector(".item-pattern-future-online");

	if (!pattern) {
		const pattern = document.createElement("div");
		pattern.className = "item-pattern-future-online";
		footer.appendChild(pattern);
	}

	const titleMap = {
		mensagens: "Mensagens",
		audios: "Áudios",
		midias: "Mídias",
		funis: "Funis",
	};

	differences.forEach(async (diff) => {
		const data = await loadStorageData(diff.type);
		const pattern = document.querySelector(
			".item-pattern-future-online",
		) as HTMLDivElement;
		const item: Midia | Audio | Funil | Mensagem = data.find(
			(item) => item.id === diff.id,
		);
		if (!pattern) return;

		if (diff.action === "added") {
			const content = pattern.querySelector(
				`.item-message-future-online.${diff.type}`,
			);

			if (!content) {
				const processedData = [];
				processedData.push(item);

				loadItens({
					titleText: titleMap[diff.type],
					itens: processedData,
					pattern,
					type: diff.type,
				});

				return;
			}

			const button = createButton(item, `button-${diff.type}-future-online`);
			content.appendChild(button);
		} else if (diff.action === "removed") {
			const content = pattern.querySelector(
				`.item-message-future-online.${diff.type}`,
			);

			if (!content) return;

			const buttons = content.querySelectorAll("button");

			buttons.forEach((button) => {
				const elementId = button.id;

				const existsInNewData = data.some((item) => item.id === elementId);

				if (!existsInNewData) {
					content.removeChild(button);
				}
			});

			if (content.children.length === 1) {
				while (content.firstChild) {
					content.removeChild(content.firstChild);
				}
			}
		} else if (diff.action === "changed") {
			const content = pattern.querySelector(
				`.item-message-future-online.${diff.type}`,
			);

			if (!content) return;

			const buttons = content.querySelectorAll("button");
			let buttonIndex = -1;

			buttons.forEach((button, index) => {
				const elementId = button.id;

				if (elementId === item.id) {
					buttonIndex = index + 1;
					content.removeChild(button);
				}
			});

			const button = createButton(item, `button-${diff.type}-future-online`);
			if (buttonIndex >= 0 && buttonIndex < content.children.length) {
				content.insertBefore(button, content.children[buttonIndex]);
			} else {
				content.appendChild(button);
			}
		}

		if (pattern.children.length === 0) {
			while (pattern.firstChild) {
				pattern.removeChild(pattern.firstChild);
			}
		}
	});

	chrome.storage.sync.set({ ...newData });
	return {
		data: newData,
		passDifference: true,
	};
};

type Difference = {
	id: string;
	type: "mensagens" | "audios" | "midias" | "funis" | "account";
	action: "changed" | "removed" | "added";
};

const findDifferences = (
	oldData: StorageData,
	newData: StorageData,
): Difference[] => {
	const differences: Difference[] = [];

	const compareArrays = <U extends Mensagem | Midia | Funil | Audio>(
		type: "mensagens" | "audios" | "midias" | "funis" | "account",
		arr1: U[] = [],
		arr2: U[] = [],
	): void => {
		const ids1 = arr1.map((item) => item.id);
		const ids2 = arr2.map((item) => item.id);

		const uniqueIds = Array.from(new Set([...ids1, ...ids2]));

		uniqueIds.forEach((id) => {
			const item1 = arr1.find((item) => item.id === id);
			const item2 = arr2.find((item) => item.id === id);

			if (!item1) {
				differences.push({ id, type, action: "added" });
			} else if (!item2) {
				differences.push({ id, type, action: "removed" });
			} else {
				if (
					type === "mensagens" &&
					((item1 as Mensagem).content !== (item2 as Mensagem).content ||
						(item1 as Mensagem).delay !== (item2 as Mensagem).delay ||
						(item1 as Mensagem).title !== (item2 as Mensagem).title)
				) {
					differences.push({ id, type, action: "changed" });
				} else if (
					type === "midias" &&
					((item1 as Midia).file.url !== (item2 as Midia).file.url ||
						(item1 as Midia).file.subtitle !== (item2 as Midia).file.subtitle ||
						(item1 as Midia).file.preview !== (item2 as Midia).file.preview ||
						(item1 as Midia).file.type !== (item2 as Midia).file.type ||
						(item1 as Midia).delay !== (item2 as Midia).delay ||
						(item1 as Midia).title !== (item2 as Midia).title)
				) {
					differences.push({ id, type, action: "changed" });
				} else if (type === "funis") {
					const item1Funil = item1 as Funil;
					const item2Funil = item2 as Funil;

					const itemChanged = item1Funil.item.some((item, index) => {
						const otherItem = item2Funil.item[index];
						return (
							item.selectedId !== otherItem.selectedId ||
							item.type !== otherItem.type ||
							item.delay.minutes !== otherItem.delay.minutes ||
							item.delay.seconds !== otherItem.delay.seconds
						);
					});

					if (
						item1Funil.title !== item2Funil.title ||
						item1Funil.item.length !== item2Funil.item.length ||
						itemChanged
					) {
						differences.push({ id, type, action: "changed" });
					}
				} else if (
					type === "audios" &&
					((item1 as Audio).audio.url !== (item2 as Audio).audio.url ||
						(item1 as Audio).audio.preview !== (item2 as Audio).audio.preview ||
						(item1 as Audio).delay !== (item2 as Audio).delay ||
						(item1 as Audio).title !== (item2 as Audio).title)
				) {
					differences.push({ id, type, action: "changed" });
				}
			}
		});
	};

	compareArrays("mensagens", oldData.mensagens, newData.mensagens);
	compareArrays("midias", oldData.midias, newData.midias);
	compareArrays("funis", oldData.funis, newData.funis);
	compareArrays("audios", oldData.audios, newData.audios);

	if (oldData.account.isLogin !== newData.account.isLogin) {
		differences.push({ id: "account", type: "account", action: "changed" });
	} else if (oldData.account.licenseDate !== newData.account.licenseDate) {
		differences.push({ id: "account", type: "account", action: "changed" });
	}

	return differences;
};

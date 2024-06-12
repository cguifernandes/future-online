import type { Funil, Gatilho, Mensagem, Midia } from "../type/type";

window.addEventListener("sendMessage", async (e: CustomEvent) => {
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;
	const { content } = e.detail;

	try {
		await WPP.chat.markIsComposing(chatId);
		await WPP.chat.sendTextMessage(chatId, content);
	} catch (e) {
		console.error("Erro ao enviar a mensagem:", e);
	}
});

window.addEventListener("sendFile", async (e: CustomEvent) => {
	try {
		const { file, subtitle } = e.detail;
		const activeChat = WPP.chat.getActiveChat();
		if (!activeChat?.id?._serialized) return;

		const chatId = activeChat.id._serialized;

		await WPP.chat.sendFileMessage(chatId, file, {
			type: "auto-detect",
			caption: subtitle,
		});
	} catch (error) {
		console.error("Erro ao enviar o arquivo:", error);
	}
});

const sendFunil = async (
	selectedItems: (Midia | Mensagem)[],
	chatId: string,
) => {
	for (let i = 0; i < selectedItems.length; i++) {
		const funilItem = selectedItems[i];

		if (i > 0) {
			await new Promise((resolve) => setTimeout(resolve, funilItem.delay));
		}

		if (funilItem.type === "mensagens") {
			await WPP.chat.markIsComposing(chatId, funilItem.delay);
			await WPP.chat.sendTextMessage(chatId, funilItem.content);
		}

		if (funilItem.type === "midias") {
			const fileName = new Date().getTime().toString();
			const file: File = await new Promise((resolve) => {
				const handler = (event: CustomEvent) => {
					window.removeEventListener(
						"saveFileResponse",
						handler as EventListener,
					);
					resolve(event.detail);
				};
				window.addEventListener("saveFileResponse", handler as EventListener);
				window.dispatchEvent(
					new CustomEvent("saveFile", {
						detail: { path: funilItem.image.url, fileName },
					}),
				);
			});

			await WPP.chat.sendFileMessage(chatId, file, {
				type: "auto-detect",
				caption: funilItem.image.subtitle,
			});
		}
	}
};

window.addEventListener("initGatilho", () => {
	WPP.on("chat.new_message", async (msg) => {
		if (msg.type !== "chat") return;
		if (msg.attributes.id.fromMe === true) return;
		const message = msg.body;
		const isGroup = msg.from.server === "g.us";

		const gatilhos: Gatilho[] = await new Promise((resolve) => {
			const handler = (event) => {
				window.removeEventListener("getGatilhos", handler);
				resolve(event.detail);
			};

			window.addEventListener("getGatilhos", handler);
			window.dispatchEvent(new CustomEvent("getGatilhosRequest"));
		});

		const selectedGatilhos = gatilhos.filter(
			(gatilho) => gatilho.active && gatilho.keywords.key.length > 0,
		);

		for (let i = 0; i < selectedGatilhos.length; i++) {
			const gatilho = selectedGatilhos[i];

			if (gatilho.saveContacts && !msg.attributes.senderObj.isMyContact) {
				continue;
			}

			if (gatilho.sendGroups && isGroup) {
				continue;
			}

			for (let j = 0; j < gatilho.keywords.key.length; j++) {
				const type = gatilho.keywords.type.value;
				const key = gatilho.keywords.key[j];
				const chatId = msg.attributes.id.remote._serialized;

				const {
					selectedItems,
				}: {
					selectedItems: Mensagem[] | Midia[];
				} = await new Promise((resolve) => {
					const handler = (event: CustomEvent) => {
						window.removeEventListener(
							"getFunilWithIdResponse",
							handler as EventListener,
						);
						resolve(event.detail);
					};

					window.addEventListener(
						"getFunilWithIdResponse",
						handler as EventListener,
					);

					window.dispatchEvent(
						new CustomEvent("getFunilWithIdRequest", {
							detail: { id: gatilho.funil.id },
						}),
					);
				});

				if (type === "equals") {
					let isMatch = false;
					if (gatilho.ignoreCase) {
						isMatch = message.toLowerCase() === key.toLowerCase();

						if (isMatch) {
							sendFunil(selectedItems, chatId);
							return;
						}
					} else {
						isMatch = message === key;

						if (isMatch) {
							sendFunil(selectedItems, chatId);
							return;
						}
					}
				}

				if (type === "contains") {
					let isMatch = false;
					if (gatilho.ignoreCase) {
						isMatch = message.toLowerCase().includes(key.toLowerCase());
					} else {
						isMatch = message.includes(key);
					}
					if (isMatch) {
						sendFunil(selectedItems, chatId);
						return;
					}
				}

				if (type === "startsWith") {
					let isMatch = false;
					if (gatilho.ignoreCase) {
						isMatch = message.toLowerCase().startsWith(key.toLowerCase());
					} else {
						isMatch = message.startsWith(key);
					}
					if (isMatch) {
						sendFunil(selectedItems, chatId);
						return;
					}
				}

				if (type === "notContains") {
					let isMatch = false;
					if (gatilho.ignoreCase) {
						isMatch = !message.toLowerCase().includes(key.toLowerCase());
					} else {
						isMatch = !message.includes(key);
					}
					if (isMatch) {
						sendFunil(selectedItems, chatId);
						return;
					}
				}
			}
		}
	});
});

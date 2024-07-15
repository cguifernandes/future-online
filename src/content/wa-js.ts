import type { Audio, Gatilho, Mensagem, Midia } from "../type/type";

window.addEventListener("sendMessage", async (e: CustomEvent) => {
	const { content, delay, chatId: eventChatId } = e.detail;

	const activeChat = WPP.chat.getActiveChat();
	const chatId = eventChatId || activeChat?.id?._serialized;

	if (!chatId) return;

	const calculatedDelay = delay ?? Math.min(content.length * 100, 5000);

	try {
		await WPP.chat.markIsComposing(chatId, calculatedDelay).finally(() => {
			if (!delay) {
				window.dispatchEvent(new CustomEvent("loadingEnd"));
			}
		});
		await WPP.chat.sendTextMessage(chatId, content);
	} catch (e) {
		console.error("Erro ao enviar a mensagem:", e);
	}
});

const sendFileMessage = async (
	chatId: string,
	file: Blob | File,
	delay: number,
	subtitle?: string,
) => {
	if (file.type.startsWith("audio")) {
		await WPP.chat.sendFileMessage(chatId, file, {
			type: "audio",
			mimetype: file.type,
			isPtt: true,
			delay,
		});

		return;
	}

	await WPP.chat.sendFileMessage(chatId, file, {
		type: "auto-detect",
		caption: subtitle,
		mimetype: file.type,
		delay,
	});
};

window.addEventListener("sendFile", async (e: CustomEvent) => {
	try {
		const { file, subtitle, delay, type, chatId: eventChatId } = e.detail;
		const activeChat = WPP.chat.getActiveChat();
		const chatId = eventChatId || activeChat?.id?._serialized;

		if (!chatId) return;

		if (type === "audios") {
			await WPP.chat.markIsRecording(chatId, delay ?? 30000);
			await sendFileMessage(chatId, file, delay, subtitle);
			window.dispatchEvent(new CustomEvent("loadingEnd"));

			return;
		}

		await sendFileMessage(chatId, file, delay, subtitle).finally(() => {
			window.dispatchEvent(new CustomEvent("loadingEnd"));
		});
	} catch (error) {
		console.error("Erro ao enviar o arquivo:", error);
	}
});

const sendFunil = async (
	selectedItems: (Midia | Mensagem | Audio)[],
	chatId: string,
) => {
	for (let i = 0; i < selectedItems?.length; i++) {
		const funilItem = selectedItems[i];

		if (funilItem.type === "mensagens") {
			await new Promise((resolve) => {
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: {
							content: funilItem.content,
							delay: funilItem.delay,
							chatId,
						},
					}),
				);
				setTimeout(resolve, funilItem.delay);
			});
		} else if (funilItem.type === "midias") {
			const fileName = new Date().getTime().toString();

			await new Promise((resolve) => {
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
						detail: { path: funilItem.file.url, fileName },
					}),
				);
			}).then((file: File) => {
				return new Promise((resolve) => {
					window.dispatchEvent(
						new CustomEvent("sendFile", {
							detail: {
								file,
								subtitle: funilItem.file.subtitle,
								delay: funilItem.delay,
								chatId,
							},
						}),
					);
					setTimeout(resolve, funilItem.delay);
				});
			});
		} else if (funilItem.type === "audios") {
			const fileName = new Date().getTime().toString();
			await new Promise((resolve) => {
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
						detail: { path: funilItem.audio.url, fileName },
					}),
				);
			}).then((file: File) => {
				return new Promise((resolve) => {
					window.dispatchEvent(
						new CustomEvent("sendFile", {
							detail: {
								file,
								delay: funilItem.delay,
								chatId,
							},
						}),
					);
					setTimeout(resolve, funilItem.delay);
				});
			});
		}
	}
};

const initGatilho = () => {
	try {
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

			if (!gatilhos) return;

			const selectedGatilhos = gatilhos?.filter(
				(gatilho) => gatilho.active && gatilho.keywords.key?.length > 0,
			);

			for (let i = 0; i < selectedGatilhos?.length; i++) {
				const gatilho = selectedGatilhos[i];
				if (gatilho.saveContacts && !msg.attributes.senderObj.isMyContact) {
					continue;
				}

				if (gatilho.sendGroups && isGroup) {
					continue;
				}

				for (let j = 0; j < gatilho.keywords.key?.length; j++) {
					const type = gatilho.keywords.type.value;
					const key = gatilho.keywords.key[j];
					const chatId = msg.attributes.id.remote._serialized;
					const {
						selectedItems,
					}: {
						selectedItems: Mensagem[] | Midia[] | Audio[];
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
	} catch (e) {
		console.log(e);
	}
};

initGatilho();

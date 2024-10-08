import type { Audio, Contact, Gatilho, Mensagem, Midia } from "../type/type";

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

	if (file.type.startsWith("application")) {
		await WPP.chat.sendFileMessage(chatId, file, {
			type: "document",
			mimetype: file.type,
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

	return;
};

window.addEventListener("sendFile", async (e: CustomEvent) => {
	try {
		const { file, subtitle, delay, type, chatId: eventChatId } = e.detail;
		const activeChat = WPP.chat.getActiveChat();
		const chatId = eventChatId || activeChat?.id?._serialized;

		if (!chatId) return;

		if (file.type.startsWith("application")) {
			await sendFileMessage(chatId, file, delay, subtitle);
			window.dispatchEvent(new CustomEvent("loadingEnd"));

			return;
		}

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
	selectedItem: Midia | Mensagem | Audio,
	chatId: string,
) => {
	switch (selectedItem.type) {
		case "mensagens": {
			await new Promise<void>((resolve) => {
				window.dispatchEvent(
					new CustomEvent("sendMessage", {
						detail: {
							content: (selectedItem as Mensagem).content,
							delay: selectedItem.delay,
							chatId,
						},
					}),
				);
				resolve();
			});
			break;
		}

		case "audios": {
			const fileName = new Date().getTime().toString();
			const file = await new Promise((resolve) => {
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
						detail: { path: selectedItem.audio.url, fileName },
					}),
				);
			});

			return new Promise<void>((resolve) => {
				window.dispatchEvent(
					new CustomEvent("sendFile", {
						detail: {
							file,
							type: "audios",
							delay: selectedItem.delay,
							chatId,
						},
					}),
				);
				resolve();
			});
		}

		case "midias": {
			const fileName = new Date().getTime().toString();
			const file = await new Promise((resolve) => {
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
						detail: { path: selectedItem.file.url, fileName },
					}),
				);
			});

			return new Promise<void>((resolve) => {
				window.dispatchEvent(
					new CustomEvent("sendFile", {
						detail: {
							file,
							subtitle: (selectedItem as Midia).file.subtitle,
							chatId,
							delay: selectedItem.delay,
						},
					}),
				);
				resolve();
			});
		}
	}
};

window.addEventListener("initGatilho", async () => {
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
								for (let i = 0; i < selectedItems.length; i++) {
									const funilItem = selectedItems[i];

									await new Promise<void>((resolve) => {
										setTimeout(async () => {
											await sendFunil(funilItem, chatId);

											resolve();
										}, funilItem.delay ?? 1000);
									});
								}
								return;
							}
						} else {
							isMatch = message === key;
							if (isMatch) {
								for (let i = 0; i < selectedItems.length; i++) {
									const funilItem = selectedItems[i];

									await new Promise<void>((resolve) => {
										setTimeout(async () => {
											await sendFunil(funilItem, chatId);

											resolve();
										}, funilItem.delay ?? 1000);
									});
								}
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
							for (let i = 0; i < selectedItems.length; i++) {
								const funilItem = selectedItems[i];

								await new Promise<void>((resolve) => {
									setTimeout(async () => {
										await sendFunil(funilItem, chatId);

										resolve();
									}, funilItem.delay ?? 1000);
								});
							}
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
							for (let i = 0; i < selectedItems.length; i++) {
								const funilItem = selectedItems[i];

								await new Promise<void>((resolve) => {
									setTimeout(async () => {
										await sendFunil(funilItem, chatId);

										resolve();
									}, funilItem.delay ?? 1000);
								});
							}
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
							for (let i = 0; i < selectedItems.length; i++) {
								const funilItem = selectedItems[i];

								await new Promise<void>((resolve) => {
									setTimeout(async () => {
										await sendFunil(funilItem, chatId);

										resolve();
									}, funilItem.delay ?? 1000);
								});
							}
							return;
						}
					}
				}
			}
		});
	} catch (e) {
		console.log(e);
	}
});

window.addEventListener("clickTab", async (e: CustomEvent) => {
	const contacts = e.detail as Contact[];

	const allChats = await WPP.chat.list();
	allChats.forEach((chat: any) => (chat.__x_shouldAppearInList = false));

	contacts.forEach((contact) => {
		const chat: any = WPP.chat.get(contact.phone);

		chat.__x_shouldAppearInList = true;
	});

	const button = document.querySelector(
		"button.xjb2p0i.x1ypdohk.x972fbf.xcfux6l.x1qhh985.xm0m39n.xzqyx8i.xqa96yk.xvwobac.x1h2y310.x6prxxf.xo1l8bm.x1btupbp.xdxn8r.xmuu9lm.x1690sq9.x1yrsyyn.x10b6aqq.x1ye3gou.xn6708d",
	) as HTMLButtonElement;

	button.click();
});

window.addEventListener("showAllContacts", async () => {
	const allChats = await WPP.chat.list();
	allChats.forEach((chat: any) => (chat.__x_shouldAppearInList = true));

	const button = document.querySelector(
		"button.xjb2p0i.x1ypdohk.x972fbf.xcfux6l.x1qhh985.xm0m39n.xzqyx8i.xqa96yk.xvwobac.x1h2y310.x6prxxf.xo1l8bm.x1btupbp.xdxn8r.xmuu9lm.x1690sq9.x1yrsyyn.x10b6aqq.x1ye3gou.xn6708d",
	) as HTMLButtonElement;

	button.click();
});

window.addEventListener("getChatsRequest", async () => {
	const chats = await WPP.chat.list({ count: 75 });
	const chatsId = chats
		.filter((chat) => chat.shouldAppearInList)
		.map((chat) => chat.contact.id._serialized);

	const chatDetailsPromises = chatsId.map(async (chatId) => {
		const contact = await WPP.contact.get(chatId);
		const name =
			contact.name ??
			contact.verifiedName ??
			contact.pushname ??
			contact.shortName ??
			contact.id.user;

		if (!chatId) return;

		const url = await WPP.contact.getProfilePictureUrl(chatId, true);
		return {
			name,
			pfp: url ?? "https://i.imgur.com/dKirVs8.png",
			phone: contact.id._serialized,
		};
	});

	const chatDetails = await Promise.all(chatDetailsPromises);

	const event = new CustomEvent("getChats", {
		detail: chatDetails,
	});

	window.dispatchEvent(event);
});

const getRandomDelay = (delay: { value1: number; value2: number }) => {
	if (delay && delay.value1 !== undefined && delay.value2 !== undefined) {
		const min = Math.min(delay.value1, delay.value2);
		const max = Math.max(delay.value1, delay.value2);
		const randomValue = Math.random() * (max - min) + min;
		return parseFloat(randomValue.toFixed(2));
	}
	return 0;
};

window.addEventListener("sendTrigger", async (e: CustomEvent) => {
	const { message, phones, delay, id } = e.detail;
	const abortController = new AbortController();
	window.dispatchEvent(new CustomEvent("overlayTrigger"));

	const existPhones = await new Promise((resolve) => {
		window.dispatchEvent(
			new CustomEvent("existPhones", {
				detail: {
					id,
					phones,
				},
			}),
		);

		const responseHandler = (responseEvent: CustomEvent) => {
			resolve(responseEvent.detail.success);
			window.removeEventListener("existPhonesResponse", responseHandler);
		};

		window.addEventListener("existPhonesResponse", responseHandler);
	});

	if (existPhones) return;

	window.addEventListener(
		"clickCancelTrigger",
		() => {
			abortController.abort();
		},
		{ once: true },
	);

	const triggerPhones = [];

	try {
		for (const phone of phones) {
			if (abortController.signal.aborted) {
				window.dispatchEvent(new CustomEvent("triggerLoading"));
				window.dispatchEvent(new CustomEvent("triggerEnd"));
				break;
			}

			const randomDelay = getRandomDelay(delay);

			await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(async () => {
					if (abortController.signal.aborted) {
						clearTimeout(timeoutId);
						reject(new Error("Envio cancelado."));
						return;
					}

					triggerPhones.push(phone);

					const sanitizedPhone = phone.replace("+", "");

					const phoneWithSuffix = sanitizedPhone.endsWith("@c.us")
						? sanitizedPhone
						: `${sanitizedPhone}@c.us`;

					await WPP.chat.sendTextMessage(phoneWithSuffix, message);
					resolve(null);
				}, randomDelay * 1000);
			});
		}
	} catch (e) {
		if (abortController.signal.aborted) {
			window.dispatchEvent(new CustomEvent("triggerEnd"));
			window.dispatchEvent(new CustomEvent("triggerLoading"));
		} else {
			console.log(e);
		}
	} finally {
		if (triggerPhones.length > 0) {
			window.dispatchEvent(
				new CustomEvent("postPhones", {
					detail: {
						triggerPhones,
						id,
					},
				}),
			);
		}

		window.dispatchEvent(new CustomEvent("triggerEnd"));
		window.dispatchEvent(new CustomEvent("triggerLoading"));
	}
});

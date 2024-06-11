import type { Gatilho } from "../type/type";

window.addEventListener("sendMessage", async (e: CustomEvent) => {
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;
	const { content } = e.detail;

	try {
		WPP.chat.sendTextMessage(chatId, content);
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

window.addEventListener("initGatilho", () => {
	WPP.on("chat.new_message", async (msg) => {
		if (msg.type !== "chat") return;
		if (msg.attributes.id.fromMe === true) return;
		const message = msg.body;

		const gatilhos: Gatilho[] = await new Promise((resolve) => {
			const handler = (event) => {
				window.removeEventListener("getGatilhos", handler);
				resolve(event.detail);
			};
			window.addEventListener("getGatilhos", handler);
			window.dispatchEvent(new CustomEvent("getGatilhosRequest"));
		});

		// const selectedGatilhos = gatilhos.filter(
		// 	(gatilho) => gatilho.active && gatilho.keywords.length > 0,
		// );

		// for (let i = 0; i < selectedGatilhos.length; i++) {
		// 	const gatilho = selectedGatilhos[i];

		// 	if (gatilho.keywords.includes(message)) {
		// 		WPP.chat.sendTextMessage(msg.attributes.id._serialized, message);
		// 	}
		// }
	});
});

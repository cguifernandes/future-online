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

window.addEventListener("sendMessage", async (e: CustomEvent) => {
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;
	const { content } = e.detail;

	await WPP.chat.sendTextMessage(chatId, content);
});

window.addEventListener("sendFile", async (e: CustomEvent) => {
	const { file, subtitle, type } = e.detail;
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;

	try {
		if (type === "Imagem") {
			console.log(file);
			await WPP.chat.sendFileMessage(chatId, file, {
				type: "image",
				caption: subtitle,
			});
		}

		if (type === "Vídeo") {
			console.log(file);
			await WPP.chat.sendFileMessage(chatId, file, {
				type: "video",
				caption: subtitle,
			});
		}
	} catch (error) {
		console.error("Erro ao enviar o arquivo:", error);
	}
});

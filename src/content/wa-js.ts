window.addEventListener("sendMessage", async (e: CustomEvent) => {
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;
	const { content } = e.detail;

	await WPP.chat.sendTextMessage(chatId, content);
});

window.addEventListener("sendFile", async (e: CustomEvent) => {
	const { file, subtitle } = e.detail;
	const activeChat = WPP.chat.getActiveChat();
	if (!activeChat?.id?._serialized) return;

	const chatId = activeChat.id._serialized;

	try {
		window.dispatchEvent(new CustomEvent("fileUploadStart"));

		await WPP.chat.sendFileMessage(chatId, file, {
			type: "auto-detect",
			caption: subtitle,
		});
	} catch (error) {
		console.error("Erro ao enviar o arquivo:", error);
	} finally {
		window.dispatchEvent(new CustomEvent("fileUploadEnd"));
	}
});

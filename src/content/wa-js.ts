window.addEventListener("initWpp", () => {
	console.log("WPP: ", WPP.webpack.isFullReady);

	window.addEventListener("sendMessage", (e: CustomEvent) => {
		const activeChat = WPP.chat.getActiveChat();
		const message = e.detail.content;

		return WPP.chat.sendTextMessage(activeChat.id._serialized, message);
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.target === "new") {
		chrome.tabs.create({ url: request.url });
	} else if (request.target === "current") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const currentTabId = tabs[0].id;
			chrome.tabs.update(currentTabId, { url: request.url });
		});
	}
});

export const backgroundConvertUrlToFile = async (
	path: string,
	fileName: string,
) => {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.target === "new") {
		const url = processDynamicUrl(request.url);
		chrome.tabs.create({ url: chrome.runtime.getURL(url) });
	} else if (request.target === "current") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const currentTabId = tabs[0].id;
			const url = processDynamicUrl(request.url);
			chrome.tabs.update(currentTabId, { url: chrome.runtime.getURL(url) });
		});
	}
});

function processDynamicUrl(url: string) {
	const clientIdMatch = url.match(/config.html\/(.+)/);
	if (clientIdMatch) {
		const clientId = clientIdMatch[1];
		return `/pages/config.html?client_id=${clientId}`;
	}
	return url;
}

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

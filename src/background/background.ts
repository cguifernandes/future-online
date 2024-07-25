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

chrome.runtime.onInstalled.addListener(() => {
	const currentDate = new Date();
	const futureDate = new Date(currentDate);
	futureDate.setDate(currentDate.getDate() + 30);

	const futureDateString = futureDate.toISOString();

	chrome.storage.sync.set({ account: { licenseDate: futureDateString } });
});

function processDynamicUrl(url: string) {
	const clientIdMatch = url.match(/config.html\/(.+)/);
	if (clientIdMatch) {
		const clientId = clientIdMatch[1];
		return `/pages/config.html?client_id=${clientId}`;
	}
	return url;
}

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
	} else if (request.target === "triggerApi") {
		const { id, phones } = request;

		fetch(`https://futureonline.com.br/api/extesion/trigger/${id}`, {
			method: "POST",
			body: JSON.stringify({ phones }),
		})
			.then((response) => {
				if (!response.ok) {
					sendResponse({
						success: false,
						error: "Ocorreu um erro ao enviar o disparo",
					});
				}

				return response.json();
			})
			.then((response) => {
				sendResponse({ success: true, data: response });
			})
			.catch((error) => {
				console.error({ error });
				sendResponse({ success: false, error: error.message });
			});
	} else if (request.target === "existPhones") {
		const { id } = request;

		fetch(`https://futureonline.com.br/api/extesion/trigger/${id}`, {
			method: "GET",
		})
			.then((response) => {
				if (!response.ok) {
					sendResponse({
						success: false,
						error: "Ocorreu um erro ao enviar o disparo",
					});
				}

				return response.json();
			})
			.then((response) => {
				sendResponse({ success: true, data: response });
			})
			.catch((error) => {
				console.error({ error });
				sendResponse({ success: false, error: error.message });
			});
	}

	return true;
});

function processDynamicUrl(url: string) {
	const clientIdMatch = url.match(/config.html\/(.+)/);
	if (clientIdMatch) {
		const clientId = clientIdMatch[1];
		return `/pages/config.html?client_id=${clientId}`;
	}
	return url;
}

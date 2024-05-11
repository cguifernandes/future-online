chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "openDashboard") {
		chrome.tabs.create({ url: "/dashboard.html" });
	}
});

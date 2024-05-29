chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "openDashboard") {
		chrome.tabs.create({ url: "/dashboard.html" });
	}
});

export const saveFile = async (path: string, fileName: string) => {
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

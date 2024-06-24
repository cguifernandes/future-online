chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "openDashboard") {
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

// if (chrome.runtime.onInstalled && chrome.runtime.onStartup) {
// 	chrome.runtime.onInstalled.addListener((details) => {
// 		if (details.reason === "install") {
// 			const installDate = new Date().getTime();
// 			chrome.storage.sync.set({ installDate });
// 		}
// 	});

// 	setInterval(() => {
// 		chrome.storage.sync.get("installDate", (items) => {
// 			if (items.installDate) {
// 				const installDate = items.installDate;
// 				const currentDate = new Date().getTime();
// 				const differenceInMinutes = (currentDate - installDate) / (1000 * 60);

// 				if (differenceInMinutes > 1) {
// 					chrome.storage.sync.set({ expiredLicense: true });
// 				} else {
// 					chrome.storage.sync.set({ expiredLicense: false });
// 				}
// 			}
// 		});
// 	}, 10000);
// }

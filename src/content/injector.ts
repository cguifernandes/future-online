const srcs = ["content/wpp.js", "content/wa-js.js"];

async function injectScripts() {
	for (const src of srcs) {
		await injectScript(src);
	}

	const timer = setInterval(() => {
		if (document.getElementById("side")) {
			clearInterval(timer);
			window.dispatchEvent(new CustomEvent("loadWpp"));
			window.dispatchEvent(new CustomEvent("initGatilho"));
		}
	}, 1000);
}

const injectScript = (src: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = chrome.runtime.getURL(src);
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Erro ao carregar script: ${src}`));
		document.head.appendChild(script);
	});
};

injectScripts().catch((error) =>
	console.error("Erro ao injetar o script:", error),
);

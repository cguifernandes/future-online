const srcs = ["wpp.js", "wa-js.js"];

async function injectScripts() {
	for (const src of srcs) {
		await injectScript(src);
	}

	const timer = setInterval(() => {
		if (document.getElementById("side")) {
			clearInterval(timer);
			window.dispatchEvent(new CustomEvent("initWpp"));
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

window.addEventListener("loadingStart", () => {
	const loadingContainer = document.querySelector(
		".item-pattern-future-online",
	);

	if (!loadingContainer) return;

	const text = document.createElement("h2");
	const overlay = document.createElement("div");
	overlay.className = "loading-overlay";
	loadingContainer.appendChild(overlay);

	text.textContent = "Carregando...";
	text.className = "loading-text";
	overlay.appendChild(text);
});

window.addEventListener("loadingEnd", () => {
	const loadingContainer = document.querySelector(".loading-overlay");
	if (!loadingContainer) return;

	loadingContainer.remove();
});

window.addEventListener("funilStart", () => {
	const loadingContainer = document.querySelector(
		".item-pattern-future-online",
	);

	if (!loadingContainer) return;

	const text = document.createElement("h2");
	const overlay = document.createElement("div");
	overlay.className = "loading-overlay";
	loadingContainer.appendChild(overlay);

	text.textContent = "Enviando funil...";
	text.className = "loading-text";
	overlay.appendChild(text);
});

window.addEventListener("funilEnd", () => {
	const loadingContainer = document.querySelector(".loading-overlay");
	if (!loadingContainer) return;

	loadingContainer.remove();
});

injectScripts().catch((error) =>
	console.error("Erro ao injetar o script:", error),
);

import { Audio, Funil, Mensagem, Midia, StorageData } from "../type/type";
import { loadItens, revalidateStorage, showErrorMessage } from "./utils";

const waitForElement = (selector, callback) => {
	const observer = new MutationObserver(() => {
		if (document.querySelector(selector)) {
			observer.disconnect();
			callback();
			return;
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
};

const loadButton = () => {
	const nav = document.querySelector("span.x1okw0bk");
	if (!nav) return;

	let visiblePopup = false;
	const span = nav.querySelector("div > span");
	if (!span) return;
	const button = document.createElement("button");
	const div = document.createElement("div");
	const image = document.createElement("img");

	span.appendChild(div);
	div.appendChild(button);
	button.appendChild(image);
	image.src = "https://i.imgur.com/XGfAVfk.png";
	button.className = "button-future-online";
	div.className = "pattern-future-online";

	const popup = document.createElement("div");
	const buttonPopup = document.createElement("button");
	const closeButton = document.createElement("button");

	div.appendChild(popup);
	popup.className = "popup-future-online";
	popup.appendChild(buttonPopup);
	popup.appendChild(closeButton);
	buttonPopup.className = "button-popup-future-online";
	buttonPopup.textContent = "Abrir dashboard";
	closeButton.className = "close-button-future-online";
	closeButton.textContent = "X";

	popup.style.display = "none";

	buttonPopup.addEventListener("click", () => {
		chrome.runtime.sendMessage({ target: "new", url: "/pages/dashboard.html" });
	});

	closeButton.addEventListener("click", () => {
		popup.style.display = "none";
		visiblePopup = false;
	});

	button.addEventListener("click", () => {
		if (visiblePopup) {
			popup.style.display = "none";
		} else {
			popup.style.display = "flex";
		}

		visiblePopup = !visiblePopup;
	});
};

const createOrAppendPattern = (footer: HTMLElement): HTMLDivElement => {
	let pattern = footer.querySelector(
		".item-pattern-future-online",
	) as HTMLDivElement;

	if (!pattern) {
		pattern = document.createElement("div");
		pattern.className = "item-pattern-future-online";
		footer.appendChild(pattern);

		setTimeout(() => {
			if (!footer.contains(pattern)) {
				footer.appendChild(pattern);
			}
		}, 100);
	}

	return pattern;
};

const processDataType = (
	dataType: "mensagens" | "audios" | "midias" | "funis",
	data: Mensagem[] | Audio[] | Midia[] | Funil[],
	pattern: HTMLDivElement,
) => {
	if (data?.length > 0) {
		const processedData = data.map((item) => ({
			type: dataType,
			...item,
		}));

		const titleMap = {
			mensagens: "Mensagens",
			audios: "Áudios",
			midias: "Mídias",
			funis: "Funis",
		};

		loadItens({
			titleText: titleMap[dataType],
			itens: processedData,
			pattern,
			type: dataType,
		});
	}
};

const validateData = async (data: StorageData) => {
	const isNonEmptyArray = (arr: any[]) => Array.isArray(arr) && arr.length > 0;

	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = createOrAppendPattern(footer);
	if (!pattern) return;

	const messagePattern = pattern.querySelector(
		".error-message-future-online",
	) as HTMLDivElement;

	if (messagePattern) return;

	if (!data.account.isLogin) {
		showErrorMessage("Você precisa fazer login para usar o Future Online");
		return;
	}

	if (data.account.isLogin && data.account.licenseDate) {
		const licenseDate = data.account.licenseDate;
		const [day, month, year] = licenseDate.split("/");
		const convertDate = new Date(Number(year), Number(month) - 1, Number(day));
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (convertDate < today) {
			showErrorMessage("A data de licença já expirou");
			return;
		}
	}

	if (
		!data ||
		(!isNonEmptyArray(data?.funis) &&
			!isNonEmptyArray(data?.mensagens) &&
			!isNonEmptyArray(data?.midias) &&
			!isNonEmptyArray(data?.audios))
	) {
		showErrorMessage(
			"Sem nenhum item criado",
			"Crie uma conta e adiciona itens.",
		);
		return;
	}

	processDataType("mensagens", data.mensagens, pattern);
	processDataType("audios", data.audios, pattern);
	processDataType("midias", data.midias, pattern);
	processDataType("funis", data.funis, pattern);
};

window.addEventListener("loadWpp", async () => {
	waitForElement("span.x1okw0bk", () => {
		loadButton();
	});

	let data = (await chrome.storage.sync.get()) as StorageData;

	waitForElement("div#main", () => {
		const observer = new MutationObserver(() => validateData(data));

		setInterval(async () => {
			const revalidateData = await revalidateStorage(data);
			if (revalidateData.passDifference) {
				data = revalidateData.data;
			}

			const isNonEmptyArray = (arr: any[]) =>
				Array.isArray(arr) && arr.length > 0;

			const main = document.querySelector("div#main");
			if (!main) return;

			const footer = main.querySelector("footer");
			if (!footer) return;

			const pattern = footer.querySelector(
				".item-pattern-future-online",
			) as HTMLDivElement;

			if (!pattern) createOrAppendPattern(footer);

			if (!data?.account.isLogin) {
				showErrorMessage("Você precisa fazer login para usar o Future Online");
				return;
			}

			if (data.account.isLogin && data.account.licenseDate) {
				const licenseDate = data.account.licenseDate;
				const [day, month, year] = licenseDate.split("/");
				const convertDate = new Date(
					Number(year),
					Number(month) - 1,
					Number(day),
				);
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				if (convertDate < today) {
					showErrorMessage("A data de licença já expirou");
					return;
				}
			}

			if (
				!data ||
				(!isNonEmptyArray(data?.funis) &&
					!isNonEmptyArray(data?.mensagens) &&
					!isNonEmptyArray(data?.midias) &&
					!isNonEmptyArray(data?.audios))
			) {
				showErrorMessage(
					"Sem nenhum item criado",
					"Crie uma conta e adiciona itens.",
				);
				return;
			}
		}, 2500);

		observer.observe(document.querySelector("div#main"), {
			childList: true,
			subtree: true,
		});
	});
});

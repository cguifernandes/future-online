import { Audio, Funil, Mensagem, Midia, StorageData } from "../type/type";
import {
	changeMessageError,
	clearMessageError,
	clearPatternContent,
	createOrAppendPattern,
	loadItens,
	revalidateStorage,
	showErrorMessage,
} from "./utils";

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

const debounce = (func: (...args: any[]) => void, wait: number) => {
	let timeout: NodeJS.Timeout;
	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

const isNonEmptyArray = (arr: any[]) => Array.isArray(arr) && arr.length > 0;

const validateData = async (data: StorageData) => {
	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = createOrAppendPattern(footer);
	if (!pattern) return;

	if (!data.account?.isLogin) {
		showErrorMessage(
			"Você precisa estar logado para usar a extensão",
			undefined,
			pattern,
		);
		return;
	}

	if (data.account?.isLogin && data.account.licenseDate) {
		const licenseDate = data.account.licenseDate;
		const [day, month, year] = licenseDate.split("/");
		const convertDate = new Date(Number(year), Number(month) - 1, Number(day));
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (convertDate < today) {
			const existMessageError = pattern.querySelector(
				".error-message-future-online",
			);

			if (existMessageError) {
				changeMessageError("A data de licença já expirou");
			}

			showErrorMessage("A data de licença já expirou", undefined, pattern);
			return;
		}
	}

	if (
		data.account?.isLogin &&
		(!data ||
			(!isNonEmptyArray(data?.funis) &&
				!isNonEmptyArray(data?.mensagens) &&
				!isNonEmptyArray(data?.midias) &&
				!isNonEmptyArray(data?.audios)))
	) {
		const existMessageError = pattern.querySelector(
			".error-message-future-online",
		);

		if (existMessageError) {
			changeMessageError(
				"Sem items para ser exibido",
				"Acesse o dashboard para criar novos items",
			);
		}

		showErrorMessage(
			"Sem items para ser exibido",
			"Acesse o dashboard para criar novos items",
			pattern,
		);

		return;
	}

	processDataType("mensagens", data.mensagens, pattern);
	processDataType("audios", data.audios, pattern);
	processDataType("midias", data.midias, pattern);
	processDataType("funis", data.funis, pattern);

	return;
};

const debouncedValidateData = debounce(validateData, 100);

window.addEventListener("loadWpp", async () => {
	waitForElement("span.x1okw0bk", () => {
		loadButton();
	});

	let data = (await chrome.storage.sync.get()) as StorageData;

	waitForElement("div#main", () => {
		const observer = new MutationObserver(() => {
			debouncedValidateData(data);
		});

		setInterval(async () => {
			const main = document.querySelector("div#main");
			if (!main) return;

			const footer = main.querySelector("footer");
			if (!footer) return;

			const pattern = createOrAppendPattern(footer);
			if (!pattern) return;

			const revalidateData = await revalidateStorage(data);
			if (revalidateData.passDifference) {
				data = revalidateData.data;
			}

			if (!data.account?.isLogin) {
				clearPatternContent();
				showErrorMessage(
					"Você precisa estar logado para usar a extensão",
					undefined,
					pattern,
				);
				return;
			}

			if (data.account?.isLogin && data.account.licenseDate) {
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
					const existMessageError = pattern.querySelector(
						".error-message-future-online",
					);

					clearPatternContent();
					if (existMessageError) {
						changeMessageError("A data de licença já expirou");
					}

					showErrorMessage("A data de licença já expirou", undefined, pattern);
					return;
				}
			}

			if (
				data.account?.isLogin &&
				(!data ||
					(!isNonEmptyArray(data?.funis) &&
						!isNonEmptyArray(data?.mensagens) &&
						!isNonEmptyArray(data?.midias) &&
						!isNonEmptyArray(data?.audios)))
			) {
				const existMessageError = pattern.querySelector(
					".error-message-future-online",
				);
				clearPatternContent();

				if (existMessageError) {
					changeMessageError(
						"Sem items para ser exibido",
						"Acesse o dashboard para criar novos items",
					);
				}

				showErrorMessage(
					"Sem items para ser exibido",
					"Acesse o dashboard para criar novos items",
					pattern,
				);

				return;
			}

			clearMessageError();
		}, 2500);

		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
});

import {
	Audio,
	Contact,
	Funil,
	Mensagem,
	Midia,
	StorageData,
	Tabs,
	Trigger,
} from "../type/type";
import {
	changeMessageError,
	clearPatternContent,
	createOrAppendPattern,
	loadItens,
	showErrorMessage,
} from "./utils";
import {
	Mail,
	Image,
	Mic,
	Filter,
	SquareKanban,
	createElement,
	IconNode,
	Rocket,
} from "lucide";

const elSideBar: {
	type: "mensagens" | "midias" | "audios" | "funis" | "kanban" | "triggers";
	icon: IconNode;
	title:
		| "Mensagens"
		| "Mídias"
		| "Áudios"
		| "Funis"
		| "Kanban"
		| "Disparos em massa";
}[] = [
	{ type: "mensagens", icon: Mail, title: "Mensagens" },
	{ type: "midias", icon: Image, title: "Mídias" },
	{ type: "audios", icon: Mic, title: "Áudios" },
	{ type: "funis", icon: Filter, title: "Funis" },
	{ type: "triggers", icon: Rocket, title: "Disparos em massa" },
	{ type: "kanban", icon: SquareKanban, title: "Kanban" },
];

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

const processDataType = (
	dataType: "mensagens" | "audios" | "midias" | "funis" | "triggers",
	data: Mensagem[] | Audio[] | Midia[] | Funil[] | Trigger[],
	pattern: HTMLDivElement,
) => {
	if (data?.length > 0) {
		const processedData = data.map((item) => ({
			type: dataType,
			...item,
		}));

		loadItens({
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

const sideBar = () => {
	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const existingSideBar = footer.querySelector(".sidebar-future-online");

	if (existingSideBar) return;
	footer.style.position = "relative";

	const sideBar = document.createElement("div");
	sideBar.className = "sidebar-future-online";

	elSideBar.forEach(async (el) => {
		const button = document.createElement("button");
		const icon = createElement(el.icon);

		button.id = el.type;
		button.title = el.title;

		button.addEventListener("click", async () => {
			const data = (await chrome.storage.sync.get(el.type)) as StorageData;

			showItens(el.type, data);
		});

		button.appendChild(icon);
		sideBar.appendChild(button);
	});

	footer.appendChild(sideBar);
};

const showItens = (
	type: "mensagens" | "midias" | "audios" | "funis" | "kanban" | "triggers",
	data: StorageData,
) => {
	if (type === "kanban") {
		chrome.runtime.sendMessage({
			target: "new",
			url: "/pages/crm.html",
		});

		return;
	}

	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = createOrAppendPattern(footer);
	if (!pattern) return;

	const selectedItem = data[type];

	if (!isNonEmptyArray(selectedItem)) {
		const existMessageError = pattern.querySelector(
			".error-message-future-online",
		);

		clearPatternContent();

		const { noItems, dashboard } = formatMessageError[type];

		if (existMessageError) {
			changeMessageError(noItems, dashboard);
		}

		showErrorMessage(noItems, dashboard, pattern);

		return;
	}

	if (pattern.children.length > 0) {
		while (pattern.firstChild) {
			pattern.removeChild(pattern.firstChild);
		}
	}

	processDataType(type, data[type], pattern);
};

window.addEventListener("existPhones", async (e: CustomEvent) => {
	const extensionId = chrome.runtime.id;
	const { id, phones }: { id: string; phones: string[] } = e.detail;

	chrome.runtime.sendMessage(
		extensionId,
		{
			target: "existPhones",
			id,
		},
		async (result) => {
			let success = true;

			if (result.success) {
				const databasePhones: string[] = result.data.data.phones;

				if (databasePhones.length > 0) {
					const matchingPhones = phones.filter((phone) =>
						databasePhones.includes(phone),
					);

					if (matchingPhones.length > 0) {
						window.dispatchEvent(new CustomEvent("triggerEnd"));

						window.dispatchEvent(
							new CustomEvent("triggerError", {
								detail: {
									errorMessage: `Os telefones ${matchingPhones.map(
										(phone) => phone,
									)}, já estão cadastrados, remova-os para conseguir enviar o disparo`,
								},
							}),
						);

						await new Promise((resolve) => setTimeout(resolve, 5000));

						window.dispatchEvent(new CustomEvent("triggerEnd"));

						success = true;
					} else {
						success = false;
					}
				} else {
					success = false;
				}
			} else {
				console.log("Erro ao pegar os telefones:", chrome.runtime.lastError);
			}

			window.dispatchEvent(
				new CustomEvent("existPhonesResponse", {
					detail: { success },
				}),
			);
		},
	);
});

window.addEventListener("postPhones", async (e: CustomEvent) => {
	const extensionId = chrome.runtime.id;
	const { triggerPhones, id } = e.detail;

	chrome.runtime.sendMessage(
		extensionId,
		{
			target: "triggerApi",
			id,
			phones: triggerPhones,
		},
		(result) => {
			if (result.success) {
				window.dispatchEvent(new CustomEvent("triggerEnd"));
			} else {
				console.log("Erro ao enviar mensagem:", chrome.runtime.lastError);
			}
		},
	);
});

const isNonEmptyArray = (arr: any[]) => Array.isArray(arr) && arr.length > 0;

const validateData = async (data: StorageData) => {
	if (!data || Object.keys(data).length === 0) {
		const main = document.querySelector("div#main");
		if (!main) return;

		const footer = main.querySelector("footer");
		if (!footer) return;

		const pattern = createOrAppendPattern(footer);
		if (!pattern) return;

		const existingSideBar = footer.querySelector(".sidebar-future-online");

		if (existingSideBar) {
			existingSideBar.remove();
		}

		const existMessageError = pattern.querySelector(
			".error-message-future-online",
		);

		if (existMessageError) return;

		showErrorMessage(
			"Você precisa fazer login para acessar os disparos",
			"Acesse o popup e faça o login",
			pattern,
		);
		return;
	}

	if (data.account) {
		if (data.account.licenseDate) {
			const licenseDate = new Date(data.account.licenseDate);
			const licenseDateWithoutTime = new Date(licenseDate);
			licenseDateWithoutTime.setHours(0, 0, 0, 0);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (licenseDateWithoutTime < today) {
				const main = document.querySelector("div#main");
				if (!main) return;

				const footer = main.querySelector("footer");
				if (!footer) return;

				const pattern = createOrAppendPattern(footer);
				if (!pattern) return;

				const existMessageError = pattern.querySelector(
					".error-message-future-online",
				);

				const existingSideBar = footer.querySelector(".sidebar-future-online");

				if (existingSideBar) {
					existingSideBar.remove();
				}

				if (existMessageError) {
					changeMessageError("A data de licença já expirou");
					return;
				}

				showErrorMessage("A data de licença já expirou", undefined, pattern);
				return;
			}
		}

		if (!data.account.isLogin) {
			const main = document.querySelector("div#main");
			if (!main) return;

			const footer = main.querySelector("footer");
			if (!footer) return;

			const pattern = createOrAppendPattern(footer);
			if (!pattern) return;

			const existMessageError = pattern.querySelector(
				".error-message-future-online",
			);

			const existingSideBar = footer.querySelector(".sidebar-future-online");

			if (existingSideBar) {
				existingSideBar.remove();
			}

			if (existMessageError) return;

			showErrorMessage(
				"Você precisa fazer login para acessar os disparos",
				"Acesse o popup e faça o login",
				pattern,
			);
			return;
		}
	}

	const main = document.querySelector("div#main");
	if (!main) return;

	const footer = main.querySelector("footer");
	if (!footer) return;

	const pattern = footer.querySelector(".item-pattern-future-online");

	if (pattern && pattern.children) {
		const errorMessage = pattern.querySelector(".error-message-future-online");
		if (errorMessage) {
			const message = errorMessage.querySelector("span");

			if (
				message.textContent ===
				"Você precisa fazer login para acessar os disparos"
			) {
				pattern.remove();
				return;
			}

			return;
		}
		return;
	}

	sideBar();
};

const formatMessageError = {
	mensagens: {
		noItems: "Sem mensagens para serem exibidas",
		dashboard: "Acesse o dashboard para criar novas mensagens",
	},
	midias: {
		noItems: "Sem mídias para serem exibidas",
		dashboard: "Acesse o dashboard para criar novas mídias",
	},
	audios: {
		noItems: "Sem áudios para serem exibidos",
		dashboard: "Acesse o dashboard para criar novos áudios",
	},
	funis: {
		noItems: "Sem funis para serem exibidos",
		dashboard: "Acesse o dashboard para criar novos funis",
	},
	triggers: {
		noItems: "Sem disparos em massa para serem exibidos",
		dashboard: "Acesse o dashboard para criar novos funis",
	},
};

const loadTabs = (tabs: Tabs[]) => {
	const header = document.querySelector(
		"header.x9f619.x78zum5.x1okw0bk.x6s0dn4.x7j6532.xc73u3c.x9mfa4r.xzwifym.x150wa6m",
	) as HTMLHeadElement;

	if (!header) return;

	const existingPattern = header.querySelector(".pattern-tabs-future-online");

	if (existingPattern) return;

	header.style.display = "flex";
	header.style.flexDirection = "column";
	header.style.padding = "12px";
	header.style.height = "auto";

	let divider = header.querySelector(".divider-tabs-future-online");
	if (!divider) {
		divider = document.createElement("div");
		divider.className = "divider-tabs-future-online";
		header.appendChild(divider);
	}

	const pattern = document.createElement("div");
	pattern.className = "pattern-tabs-future-online";
	const text = document.createElement("span");
	text.textContent = "Abas do CRM";
	pattern.appendChild(text);
	header.appendChild(pattern);

	let tabsContent = pattern.querySelector(".tabs-future-online");
	if (!tabsContent) {
		tabsContent = document.createElement("div");
		tabsContent.className = "tabs-future-online";
		pattern.appendChild(tabsContent);
	}

	tabs.forEach((tab) => {
		const existingTabButton = tabsContent?.querySelector(
			`button[data-tab-name="${tab.name}"]`,
		);

		if (!existingTabButton) {
			const tabButton = document.createElement("button");
			tabButton.textContent = tab.name;
			tabButton.setAttribute("data-tab-name", tab.name);
			tabButton.className = "tab-future-online-button";
			const span = document.createElement("span");
			span.textContent = ` (${tab.contacts.length})`;
			tabButton.appendChild(span);

			tabButton.addEventListener("click", async () => {
				window.dispatchEvent(
					new CustomEvent("clickTab", {
						detail: tab.contacts,
					}),
				);
			});

			tabsContent.appendChild(tabButton);
		}
	});

	const emptyButton = document.createElement("button");
	emptyButton.className = "tabs-empty-button-future-online";
	emptyButton.textContent = "Mostrar todos os contatos";

	emptyButton.addEventListener("click", () => {
		window.dispatchEvent(new CustomEvent("showAllContacts"));
	});

	tabsContent.appendChild(emptyButton);
};

const debouncedValidateData = debounce(validateData, 200);

window.addEventListener("storageContacts", async () => {
	const contacts: Contact[] = await new Promise((resolve) => {
		const handler = (event) => {
			window.removeEventListener("getChats", handler);
			resolve(event.detail);
		};
		window.addEventListener("getChats", handler);
		window.dispatchEvent(new CustomEvent("getChatsRequest"));
	});

	chrome.storage.local.set({ contacts });
});

const removeTabs = () => {
	const header = document.querySelector(
		"header.x9f619.x78zum5.x1okw0bk.x6s0dn4.x7j6532.xc73u3c.x9mfa4r.xzwifym.x150wa6m",
	) as HTMLHeadElement;

	if (!header) return;

	const pattern = header.querySelector(".pattern-tabs-future-online");

	if (pattern) {
		pattern.remove();
	}
};

window.addEventListener("loadWpp", async () => {
	let data = (await chrome.storage.sync.get("tabs")) as StorageData;

	if (data.tabs && data.tabs.length > 0) {
		loadTabs(data.tabs);

		setInterval(async () => {
			const initialData = JSON.stringify(data);
			const newData = (await chrome.storage.sync.get("tabs")) as StorageData;

			if (initialData !== JSON.stringify(newData)) {
				removeTabs();

				loadTabs(newData.tabs);
				data = newData;
			}
		}, 2500);
	}

	waitForElement("div#main", () => {
		const observer = new MutationObserver(async () => {
			const data = (await chrome.storage.sync.get()) as StorageData;
			debouncedValidateData(data);
		});

		observer.observe(document, {
			childList: true,
			subtree: true,
		});
	});
});

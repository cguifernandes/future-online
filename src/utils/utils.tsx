import { supabase } from "../lib/supabase";
import type { Funil, Gatilho, Mensagem, Midia } from "../type/type";
import { v4 as uuidv4 } from "uuid";

export const FILES_TYPE = [
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"video/mp4",
	"video/x-m4v",
];

export const ACCEPT_FILES_TYPE = [".jpeg", ".png", ".svg+xml", ".mp4", ".m4v"];

export const loadingImage = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};

		reader.readAsDataURL(file);
	});
};

export const delay = (minutes: number, seconds: number) =>
	new Promise((resolve) =>
		setTimeout(resolve, (minutes * 60 + seconds) * 1000),
	);

export const generateThumbnail = (videoFile: File, asBase64 = false) => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		video.preload = "metadata";
		video.muted = true;

		video.onloadedmetadata = () => {
			video.currentTime = Math.min(video.duration / 2, 5);
		};

		video.onseeked = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			if (asBase64) {
				const base64String = canvas.toDataURL("image/png");
				resolve(base64String);
			} else {
				canvas.toBlob((blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Failed to generate thumbnail"));
					}
				}, "image/png");
			}
		};

		video.onerror = (event) => {
			reject(new Error(`Failed to load video: ${event}`));
		};

		video.src = URL.createObjectURL(videoFile);
	});
};

export const uploadAndSign = async (path: string, content) => {
	const uploadResponse = await supabase.storage
		.from("future-online")
		.upload(path, content);

	if (uploadResponse.error) {
		console.log(uploadResponse.error);
		return null;
	}

	const { data: signedData, error: signedError } = await supabase.storage
		.from("future-online")
		.createSignedUrl(uploadResponse.data.path, 30 * 24 * 60 * 60);

	if (signedError) {
		console.log(signedError);
		return null;
	}

	return signedData.signedUrl;
};

export const getItemWithId = async (
	id: string,
	type: string,
): Promise<Item | null> => {
	const selectedType = type
		.toLocaleLowerCase()
		.normalize("NFD")
		// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
		.replace(/[\u0300-\u036f]/g, "");

	const data = await new Promise<{
		[key: string]: Item[];
	}>((resolve) => {
		chrome.storage.sync.get(null, resolve);
	});

	const itemsOfType = data[selectedType];

	if (itemsOfType && itemsOfType.length > 0) {
		return itemsOfType.find((item: Item) => item.id === id) || null;
	}

	return null;
};

export const getFunilItem = async (contentItem: Funil["item"]) => {
	const localData = [];

	const data = await new Promise((resolve) => {
		chrome.storage.sync.get(null, resolve);
	});

	for (const item of contentItem) {
		const itemsOfType =
			data[
				item.type
					.toLocaleLowerCase()
					.normalize("NFD")
					// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
					.replace(/[\u0300-\u036f]/g, "")
			];

		if (itemsOfType && itemsOfType.length > 0) {
			for (const selectedItem of itemsOfType) {
				if (item.selectedId === selectedItem.id) {
					localData.push({ item: selectedItem, ...item });
				}
			}
		}
	}

	return localData;
};

type Item = Gatilho | Funil | Mensagem | Midia;

export const addItem = <T extends Item>(
	newItem: T,
	data: { itens: T[] },
): T[] => {
	const newItemWithId = { ...newItem, id: uuidv4() };
	const newItens = [...data.itens, newItemWithId];

	chrome.storage.sync.set({ [newItem.type.toLocaleLowerCase()]: newItens });

	return newItens;
};

export const removeItem = async <T extends Midia | Mensagem | Funil | Gatilho>(
	removeItem: T,
	type: "midias" | "mensagens" | "funis" | "gatilhos",
) => {
	const items = await new Promise<T[]>((resolve) => {
		chrome.storage.sync.get(type, (result) => {
			resolve(result[type] || []);
		});
	});

	const updatedItems = items.filter((item) => item.id !== removeItem.id);

	await new Promise<void>((resolve) => {
		chrome.storage.sync.set({ [type]: updatedItems }, () => {
			resolve();
		});
	});

	return updatedItems;
};

export const getItem = async <T extends Midia | Mensagem | Funil | Gatilho>(
	type: "midias" | "mensagens" | "funis" | "gatilhos",
) => {
	const result = await new Promise<{ [key: string]: T[] }>(
		(resolve, reject) => {
			chrome.storage.sync.get(type, (items) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(items);
				}
			});
		},
	);

	return result[type] || [];
};

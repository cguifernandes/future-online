import type { Audio, Funil, Gatilho, Mensagem, Midia } from "../type/type";
import { v4 as uuidv4 } from "uuid";
import * as AWS from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const FILES_TYPE = [
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"video/mp4",
	"video/x-m4v",
];

export const url = "http://localhost:3333";

export const AUDIOS_TYPE = [
	"audio/mpeg",
	"audio/aac",
	"audio/aiff",
	"audio/flac",
];

export const convertUrlToFile = async (path: string, fileName: string) => {
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

export const ACCEPT_FILES_TYPE = [".jpeg", ".png", ".svg+xml", ".mp4", ".m4v"];
export const ACCEPT_AUDIOS_TYPE = [".mp3", ".aac", ".aiff", ".flac"];

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

export const storeBlobInIndexedDB = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const dbName = "blobDB";
		const storeName = "blobs";

		const dbRequest = indexedDB.open(dbName);

		dbRequest.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
			}
		};

		dbRequest.onsuccess = async (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			const { quota, usage } = await navigator.storage.estimate();
			const remainingSpace = quota - usage;
			const blobSize = blob.size;

			if (remainingSpace < blobSize) {
				reject(
					"Espaço insuficiente para armazenar este arquivo, apague mídias para conseguir salvar novas mídias",
				);
			}

			const transaction = db.transaction(storeName, "readwrite");
			const objectStore = transaction.objectStore(storeName);
			const request = objectStore.add({ blob });

			request.onsuccess = () => {
				resolve(request.result.toString());
			};

			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		};

		dbRequest.onerror = (event) => {
			reject((event.target as IDBRequest).error);
		};
	});
};

export const removeStorage = (fileName: string) => {
	return new Promise((resolve, reject) => {
		const s3 = new AWS.S3({
			region: process.env.AWS_REGION ?? "",
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
			},
		});

		s3.deleteObject({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: fileName,
		})
			.then(() => resolve("Imagem removida com sucesso"))
			.catch((err) => {
				console.log(err);
				reject("Erro ao remover a imagem");
			});
	});
};

export const removeItemFromIndexedDB = (id: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const dbName = "blobDB";
		const storeName = "blobs";

		const dbRequest = indexedDB.open(dbName);

		dbRequest.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			const transaction = db.transaction(storeName, "readwrite");
			const objectStore = transaction.objectStore(storeName);

			const request = objectStore.delete(Number(id));

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		};

		dbRequest.onerror = (event) => {
			reject((event.target as IDBRequest).error);
		};
	});
};

export const getBlobFromIndexedDB = (id: string): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const dbName = "blobDB";
		const storeName = "blobs";

		const dbRequest = indexedDB.open(dbName);

		dbRequest.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			const transaction = db.transaction(storeName, "readonly");
			const objectStore = transaction.objectStore(storeName);

			const request = objectStore.get(Number(id));

			request.onsuccess = () => {
				if (request.result) {
					resolve(request.result.blob);
				} else {
					reject("Arquivo não encontrado");
				}
			};

			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		};

		dbRequest.onerror = (event) => {
			reject((event.target as IDBRequest).error);
		};
	});
};

export const uploadFileOnS3 = (
	blob: Blob,
	fileName: string,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const s3 = new AWS.S3({
			region: process.env.AWS_REGION ?? "",
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
			},
		});

		new Upload({
			client: s3,
			leavePartsOnError: false,
			params: {
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: fileName,
				Body: blob,
				ContentDisposition: "inline",
				ContentType: blob.type,
			},
		})
			.done()
			.then(() => {
				const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
				resolve(url);
			})
			.catch(() => {
				reject("Ocorreu um erro ao fazer upload do arquivo");
			});
	});
};

export const blobToFile = (
	blob: Blob,
	fileName: string,
	fileType?: string,
): File => {
	const type = fileType || blob.type;
	const name = fileName;

	const file = new File([blob], name, { type });

	return file;
};

export const generateThumbnail = (
	videoFile: File,
	asBase64 = false,
): Promise<string | Blob> => {
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
						reject(new Error("Erro ao gerar a preview do arquivo"));
					}
				}, "image/png");
			}
		};

		video.onerror = (event) => {
			reject(new Error(`Erro ao carregar o vídeo: ${event}`));
		};

		video.src = URL.createObjectURL(videoFile);
	});
};

export const getItemWithId = async (
	id: string,
	type: "midias" | "mensagens" | "funis" | "gatilhos",
): Promise<Item | null> => {
	const selectedType = type
		.toLocaleLowerCase()
		.normalize("NFD")
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

type Item = Gatilho | Funil | Mensagem | Midia | Audio;

export const addItem = <T extends Item>(
	newItem: T,
	data: { itens: T[] },
): T[] => {
	const newItemWithId = { ...newItem, id: uuidv4() };
	const newItens = [...data.itens, newItemWithId];

	chrome.storage.sync.set({ [newItem.type.toLocaleLowerCase()]: newItens });

	return newItens;
};

export const removeItem = async <
	T extends Midia | Mensagem | Funil | Gatilho | Audio,
>(
	removeItem: T,
	type: "midias" | "mensagens" | "funis" | "gatilhos" | "audios",
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

	if (type === "midias" || type === "audios") {
		const isMidias = type === "midias";
		const isAudios = type === "audios";

		const url = isMidias
			? (removeItem as Midia).file.url
			: isAudios
				? (removeItem as Audio).audio.url
				: null;
		const preview = isMidias
			? (removeItem as Midia).file.preview
			: isAudios
				? (removeItem as Audio).audio.preview
				: null;

		if (preview) {
			await removeItemFromIndexedDB(preview);
		}

		if (url) {
			const match = url.match(/amazonaws\.com\/(.+)/);

			if (match && match.length > 0) {
				await removeStorage(match[1]);
			}
		}
	}

	return updatedItems;
};

export const getItem = async <
	T extends Midia | Mensagem | Funil | Gatilho | Audio,
>(
	type: "midias" | "mensagens" | "funis" | "gatilhos" | "audios",
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

export const sendFunil = async (item: Funil) => {
	let setTimeoutCount = 0;

	const processItem = async () => {
		for (const i of item.item) {
			const delayInMilliseconds =
				(i.delay.minutes * 60 + i.delay.seconds) * 1000;
			let selectedItem = null;
			try {
				const selectedType = i.type
					.toLocaleLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");

				const getStorageData = (key: string): Promise<any[]> => {
					return new Promise((resolve, reject) => {
						chrome.storage.sync.get(key, (result) => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError);
							} else {
								resolve(result[key] || []);
							}
						});
					});
				};

				const itens = await getStorageData(selectedType);
				selectedItem = itens.find((item) => item.id === i.selectedId);
			} finally {
				setTimeout(() => {
					if (selectedItem.type === "mensagens") {
						window.dispatchEvent(
							new CustomEvent("sendMessage", {
								detail: {
									content: selectedItem.content,
								},
							}),
						);
					}

					if (selectedItem.type === "midias") {
						const fileName = new Date().getTime().toString();
						convertUrlToFile(selectedItem.image.url, fileName).then((file) => {
							window.dispatchEvent(
								new CustomEvent("sendFile", {
									detail: {
										file,
										subtitle:
											selectedItem.type === "midias" &&
											selectedItem.image.subtitle,
									},
								}),
							);
						});
					}

					setTimeoutCount++;
					if (setTimeoutCount === item.item.length) {
						window.dispatchEvent(new CustomEvent("funilEnd"));
					}
				}, delayInMilliseconds);
			}

			await new Promise((resolve) => setTimeout(resolve, delayInMilliseconds));
		}
	};

	processItem();
};

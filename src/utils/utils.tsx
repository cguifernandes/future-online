import { supabase } from "../lib/supabase";
import type { Funil } from "../type/type";

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

export const getItem = async (contentItem: Funil["item"]) => {
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

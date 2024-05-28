import { supabase } from "../../lib/supabase";

export const FILES_TYPE = [
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"video/mp4",
	"video/x-m4v",
];

export const ACCEPT_FILES_TYPE = [".jpeg", ".png", ".svg+xml", ".mp4", ".m4v"];

export const loadingVideo = (
	file: File,
	setIsLoadingImage: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		video.muted = true;
		video.preload = "metadata";

		const handleLoadedMetadata = () => {
			video.currentTime = Math.min(video.duration / 2, 5);
		};

		const handleTimeUpdate = async () => {
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");

			if (ctx) {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				const image = new Image();
				image.src = canvas.toDataURL("image/jpeg");

				video.pause();
				URL.revokeObjectURL(video.src);

				setIsLoadingImage(false);
				resolve(image.src);
			} else {
				video.pause();
				URL.revokeObjectURL(video.src);

				setIsLoadingImage(false);
				reject(new Error("Failed to get canvas context"));
			}
		};

		const handleError = () => {
			video.pause();
			URL.revokeObjectURL(video.src);

			setIsLoadingImage(false);
			reject(new Error("Failed to load video"));
		};

		video.addEventListener("loadedmetadata", handleLoadedMetadata);
		video.addEventListener("timeupdate", handleTimeUpdate);
		video.addEventListener("error", handleError);

		setIsLoadingImage(true);
		video.src = URL.createObjectURL(file);
	});
};

export const loadingImage = (
	file: File,
	setIsLoadingImage: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			setIsLoadingImage(false);
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			setIsLoadingImage(false);
			reject(new Error("Failed to read file"));
		};

		setIsLoadingImage(true);
		reader.readAsDataURL(file);
	});
};

export const generateThumbnail = (videoFile: File): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		video.preload = "metadata";

		video.onloadedmetadata = () => {
			video.currentTime = Math.min(video.duration / 2, 5);
		};

		video.onseeked = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to generate thumbnail"));
				}
			}, "image/png");
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

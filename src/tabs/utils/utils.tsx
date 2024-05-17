export const FILES_TYPE = [
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"video/mp4",
	"video/x-m4v",
];

export const ACCEPT_FILES_TYPE = [".jpeg", ".png", ".svg+xml", ".mp4", ".m4v"];

export const loadingVideo = async (
	file: File,
	setImagePreview: React.Dispatch<React.SetStateAction<string>>,
	setIsLoadingImage: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const video = document.createElement("video");
	video.muted = true;
	video.preload = "metadata";

	try {
		video.onloadedmetadata = async () => {
			video.currentTime = 10;
			await video.play();

			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			const image = new Image();
			image.src = canvas.toDataURL("image/jpeg");
			setImagePreview(image.src);
			setIsLoadingImage(false);

			video.pause();
			URL.revokeObjectURL(video.src);
		};
	} catch {
		video.pause();
	} finally {
		video.pause();
	}

	video.src = URL.createObjectURL(file);
};

export const loadingImage = async (
	file: File,
	setImagePreview: React.Dispatch<React.SetStateAction<string>>,
	setIsLoadingImage: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const reader = new FileReader();

	reader.onload = () => {
		setImagePreview(reader.result as string);
		setIsLoadingImage(false);
	};

	reader.readAsDataURL(file);
};

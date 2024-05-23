// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect } from "react";
import { type InputHTMLAttributes, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import {
	ACCEPT_FILES_TYPE,
	FILES_TYPE,
	loadingImage,
	loadingVideo,
} from "../utils/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	dataItem: {
		title: string;
		image: {
			url: string;
			subtitle: string;
			preview: string;
		};
	};
	setDataItem: (
		value: React.SetStateAction<{
			title: string;
			image: {
				url: string;
				subtitle: string;
				preview: string;
			};
		}>,
	) => void;
	setError: React.Dispatch<React.SetStateAction<string>>;
	error: string;
}

const File = ({ dataItem, setDataItem, error, setError, ...rest }: Props) => {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isLoadingImage, setIsLoadingImage] = useState(false);

	useEffect(() => {
		if (dataItem.image.preview) {
			setImagePreview(dataItem.image.preview);
		} else {
			setImagePreview(null);
		}
	}, [dataItem]);

	const handlerChangeValue = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;
		const file = fileInput.files[0];

		if (file && !FILES_TYPE.includes(file.type)) {
			setError("Formato de arquivo inválido");
			return;
		}

		if (file) {
			setError(null);
			setIsLoadingImage(true);
			setImagePreview(null);

			let preview = "";
			if (file.type.includes("video")) {
				preview = await loadingVideo(file, setIsLoadingImage);
			} else {
				preview = await loadingImage(file, setIsLoadingImage);
			}

			setImagePreview(preview);
			setDataItem((prev) => ({
				...prev,
				image: {
					...prev.image,
					url: preview,
					preview,
				},
			}));
		} else {
			setImagePreview(null);
			setError(null);
			setDataItem((prev) => ({
				...prev,
				image: {
					...prev.image,
					file: undefined,
				},
			}));
		}
	};

	return (
		<div className="flex flex-col gap-y-1 w-3/5">
			<div className="flex flex-col flex-1 justify-center border-dashed border-2 border-green-600 p-3 relative rounded-lg gap-y-2">
				<div className="flex flex-col text-center text-white gap-y-1">
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="72"
						height="72"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="lucide lucide-images mx-auto"
					>
						<path d="M18 22H4a2 2 0 0 1-2-2V6" />
						<path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
						<circle cx="12" cy="8" r="2" />
						<rect width="16" height="16" x="6" y="2" rx="2" />
					</svg>
					<label htmlFor="input-file" className="text-base font-semibold">
						Clique aqui ou arraste o arquivo a ser salvo
					</label>
				</div>
				<div
					className={clsx(
						"flex flex-col gap-1 flex-1",
						isLoadingImage && "items-center justify-center",
					)}
				>
					{isLoadingImage ? (
						<span className="text-base text-white">Carregando...</span>
					) : imagePreview ? (
						<img
							className="absolute bottom-6 h-32 object-contain w-5/6 left-2/4 -translate-x-2/4"
							src={imagePreview}
							alt="Imagem"
						/>
					) : (
						<label htmlFor="input-file" className="text-white text-center">
							Formatos aceitos: <br />
							Fotos: '.jpg', '.jpeg', '.png', '.svg' <br />
							Vídeos: '.m4v', '.mp4'
						</label>
					)}
				</div>
				<input
					{...rest}
					accept={ACCEPT_FILES_TYPE.join(",")}
					onChange={handlerChangeValue}
					id="input-file"
					name="file"
					type="file"
					className="hidden"
				/>
			</div>
			{error && <span className="text-red-600 text-sm">{error}</span>}
		</div>
	);
};

export default File;

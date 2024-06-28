import { useEffect } from "react";
import { type InputHTMLAttributes, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import {
	ACCEPT_FILES_TYPE,
	FILES_TYPE,
	generateThumbnail,
	loadingImage,
} from "../../utils/utils";
import type { Audio, Midia } from "../../type/type";
import type { UseFormSetError, UseFormSetValue } from "react-hook-form";
import { Image } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	setValue?: UseFormSetValue<any>;
	name?: string;
	setError?: UseFormSetError<any>;
	error?: string;
	contentItem: Midia | Audio;
}

const File = ({
	setError,
	error,
	setValue,
	name,
	contentItem,
	...rest
}: Props) => {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isLoadingImage, setIsLoadingImage] = useState(false);

	useEffect(() => {
		if (contentItem.type === "midias") {
			if (contentItem.image.preview || contentItem.image.url) {
				setImagePreview(contentItem.image.preview || contentItem.image.url);
			} else {
				setImagePreview(null);
			}
		} else {
			if (contentItem.audio.url) {
				setImagePreview(contentItem.audio.url);
			} else {
				setImagePreview(null);
			}
		}
	}, [contentItem]);

	const handlerChangeValue = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;
		const file = fileInput.files[0];

		if (!FILES_TYPE.includes(file.type)) {
			if (setError) {
				setError(name, {
					message: "Formato de arquivo inválido",
				});
			}
			return;
		}

		if (file) {
			setIsLoadingImage(true);
			setImagePreview(null);

			if (setValue && name) {
				setValue(name, file);
			}

			let preview = "";
			if (file.type.includes("video")) {
				preview = (await generateThumbnail(file, true)) as string;
				setIsLoadingImage(false);
			} else {
				preview = await loadingImage(file);
				setIsLoadingImage(false);
			}

			setImagePreview(preview);
		} else {
			setImagePreview(null);
		}
	};

	return (
		<div className="flex flex-col gap-y-1 w-3/5">
			<div className="flex flex-col flex-1 items-center justify-center border-dashed border-2 border-green-600 p-3 relative rounded-lg gap-y-2">
				<div className="flex flex-col text-center text-white gap-y-1">
					<Image className="mx-auto" size={72} color="#fff" />
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

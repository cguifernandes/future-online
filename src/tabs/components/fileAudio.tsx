import { useEffect } from "react";
import { type InputHTMLAttributes, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import { ACCEPT_AUDIOS_TYPE, AUDIOS_TYPE } from "../../utils/utils";
import type { Audio } from "../../type/type";
import type { UseFormSetError, UseFormSetValue } from "react-hook-form";
import { Image, Mic } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	setValue?: UseFormSetValue<any>;
	name?: string;
	setError?: UseFormSetError<any>;
	error?: string;
	contentItem: Audio;
}

const Audios = ({
	setError,
	error,
	setValue,
	name,
	contentItem,
	...rest
}: Props) => {
	const [visiblePreview, setVisiblePreview] = useState(false);
	const [fileName, setFileName] = useState("");
	const [isLoadingImage, setIsLoadingImage] = useState(false);

	useEffect(() => {
		if (contentItem.audio.url !== "") {
			setVisiblePreview(true);
			setFileName(contentItem.audio.fileName);
		} else {
			setVisiblePreview(false);
			setFileName("");
		}
	}, [contentItem]);

	const handlerChangeValue = async (e: ChangeEvent<HTMLInputElement>) => {
		setIsLoadingImage(true);
		const fileInput = e.target;
		const file = fileInput.files[0];

		if (!AUDIOS_TYPE.includes(file.type)) {
			if (setError) {
				setError(name, {
					message: "Formato de arquivo inválido",
				});
			}
			setIsLoadingImage(false);
			return;
		}

		if (file) {
			if (setValue && name) {
				setValue(name, file);
			}

			setIsLoadingImage(false);
			setFileName(file.name);
			setVisiblePreview(true);
		} else {
			setVisiblePreview(false);
			setIsLoadingImage(false);
		}
	};

	return (
		<div className="flex flex-col gap-y-1 w-full flex-1">
			<div className="flex flex-col items-center justify-center border-dashed h-full border-2 border-blue-600 w-full p-3 relative rounded-lg gap-y-2">
				<div className="flex flex-col text-center text-white gap-y-1">
					<Image className="mx-auto" size={72} color="#fff" />
					<label htmlFor="input-file" className="text-base font-semibold">
						Clique aqui ou arraste o arquivo a ser salvo
					</label>
				</div>
				<div
					className={clsx(
						"flex flex-col gap-1",
						isLoadingImage && "items-center justify-center",
						visiblePreview ? "h-[72px]" : "h-auto",
					)}
				>
					{isLoadingImage ? (
						<span className="text-base text-white">Carregando...</span>
					) : (
						<>
							{visiblePreview && (
								<div className="max-w-96 absolute left-1/2 -translate-x-1/2 w-full mx-auto flex items-center p-3 bg-blue-500/50 backdrop-blur-md rounded-lg">
									<span className="text-base max-w-fit line-clamp-2 text-white">
										{fileName}
									</span>
									<Mic className="min-w-6" color="#fff" size={24} />
								</div>
							)}
							<label htmlFor="input-file" className="text-white text-center">
								Formatos aceitos: <br />
								'.mp3', '.aac', '.aiff', '.flac'
							</label>
						</>
					)}
				</div>
				<input
					{...rest}
					accept={ACCEPT_AUDIOS_TYPE.join(",")}
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

export default Audios;

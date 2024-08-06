import { useEffect } from "react";
import { type InputHTMLAttributes, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import type { Audio } from "../../type/type";
import type { UseFormSetError, UseFormSetValue } from "react-hook-form";
import { Image } from "lucide-react";
import { getBlobFromIndexedDB } from "../../utils/utils";
import toast from "react-hot-toast";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	setValue?: UseFormSetValue<any>;
	name?: string;
	setError?: UseFormSetError<any>;
	error?: string;
	contentItem: Audio;
	FILES_TYPE: string[];
	ACCEPT_FILES_TYPE: string[];
}

const Audios = ({
	setError,
	error,
	setValue,
	name,
	ACCEPT_FILES_TYPE,
	FILES_TYPE,
	contentItem,
	onChange,
	...rest
}: Props) => {
	const [audioPreview, setAudioPreview] = useState<string | null>(null);
	const [isLoadingAudio, setIsLoadingAudio] = useState(false);

	useEffect(() => {
		if (contentItem.audio.preview) {
			setIsLoadingAudio(true);

			getBlobFromIndexedDB(contentItem.audio.preview)
				.then(async (blob) => {
					const blobUrl = URL.createObjectURL(blob);
					setAudioPreview(blobUrl);
				})
				.catch((error) => {
					console.log(error);
					toast.error("Ocorreu um erro ao carregar a imagem", {
						position: "bottom-right",
						className: "text-base ring-2 ring-[#1F2937]",
						duration: 5000,
					});
				})
				.finally(() => {
					setIsLoadingAudio(false);
				});
		} else {
			setAudioPreview(null);
			setIsLoadingAudio(false);
		}
	}, [contentItem]);

	const handlerChangeValue = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files[0];
		if (!file) return;
		setIsLoadingAudio(true);

		if (file) {
			const blob = new Blob([file], { type: file.type });
			const reader = new FileReader();

			reader.onloadend = () => {
				const base64String = reader.result as string;
				setAudioPreview(base64String);
			};

			reader.onerror = () => {
				if (setError && name) {
					setError(name, {
						message: "Erro ao ler o arquivo",
					});
				}
				setIsLoadingAudio(false);
			};

			reader.readAsDataURL(file);

			if (setValue && name) {
				setValue(name, blob);
			}

			onChange(e);
			setIsLoadingAudio(false);
		} else {
			setIsLoadingAudio(false);
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
						"flex flex-col gap-1 relative",
						isLoadingAudio && "items-center justify-center",
					)}
				>
					{isLoadingAudio ? (
						<span className="text-base text-white">Carregando...</span>
					) : (
						<>
							{audioPreview !== null && (
								<audio
									className="absolute left-1/2 -translate-x-1/2"
									src={audioPreview}
									controls
								/>
							)}
							<label htmlFor="input-file" className="text-white text-center">
								Formatos aceitos: <br />
								.mp3 .ogg .wave
							</label>
						</>
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

export default Audios;

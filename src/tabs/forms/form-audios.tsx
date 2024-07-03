import { useEffect, useState } from "react";
import Input from "../components/input";
import { Trash2 } from "lucide-react";
import Button from "../components/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Audio } from "../../type/type";
import {
	ACCEPT_AUDIOS_TYPE,
	AUDIOS_TYPE,
	removeItem,
	storeBlobInIndexedDB,
	uploadFileOnS3,
} from "../../utils/utils";
import Audios from "../components/fileAudio";
import toast from "react-hot-toast";

interface Props {
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Audio[];
		}>
	>;
	setContentItem: React.Dispatch<React.SetStateAction<Audio>>;
	contentItem: Audio;
}

const Form = ({ contentItem, setContentItem, setData }: Props) => {
	const [isLoading, setIsLoading] = useState(false);

	const schema = z.object({
		title: z.string(),
		audio: z.object({
			url: z.string(),
			blob: z
				.instanceof(Blob, { message: "O arquivo deve ser um áudio" })
				.refine(
					(value) => value.type.startsWith("audio"),
					"O arquivo deve ser um áudio",
				)
				.refine(
					(value) => value.size < 3 * 1024 * 1024 * 1024,
					"Tamanho do arquivo excedeu 3 GB",
				)
				.optional(),
			fileName: z.string().optional(),
		}),
	});

	const {
		handleSubmit,
		register,
		setValue,
		setError,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: "Novo contéudo" || contentItem.title,
			audio: {
				url: "" || contentItem.audio.url,
				blob: undefined,
			},
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			audio: {
				url: contentItem.audio.url,
				blob: undefined,
			},
		});
	}, [contentItem, reset]);

	const handlerSubmit = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			let url = "";
			let preview = "";

			if (formData.audio?.blob) {
				const blobId = await storeBlobInIndexedDB(formData.audio.blob);
				const fileUrl = await uploadFileOnS3(
					formData.audio.blob,
					formData.audio.fileName,
					"teste/",
				);

				preview = blobId;
				url = fileUrl;
			}

			const updatedItem: Audio = {
				...contentItem,
				title: formData.title,
				audio: {
					url: url !== "" ? url : contentItem.audio.url,
					preview: preview !== "" ? preview : contentItem.audio.preview,
				},
			};

			chrome.storage.sync.get("audios", (result) => {
				const updatedItems = result.audios.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ audios: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
					toast.success(
						"Alterações salvas. Por favor, atualize a página do WhatsApp para vê-las",
						{
							position: "bottom-right",
							className: "text-base ring-2 ring-[#1F2937]",
							duration: 5000,
						},
					);
				});
			});
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmit)}
			className="flex flex-col gap-y-3 items-center justify-center p-4 h-full"
		>
			<div className="flex gap-x-3 w-full">
				<Input
					{...register("title")}
					placeholder="Título do item"
					className="w-full"
					patternClassName="flex-1 h-12"
					name="title"
					theme="blue"
					maxLength={24}
				/>
				<button
					type="button"
					onClick={async () => {
						setData({ itens: await removeItem(contentItem, "audios") });
						setContentItem(undefined);
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<Trash2 color="#fff" size={24} strokeWidth={1.5} />
				</button>
			</div>
			<Audios
				contentItem={contentItem}
				setValue={setValue}
				name="audio.blob"
				ACCEPT_FILES_TYPE={ACCEPT_AUDIOS_TYPE}
				FILES_TYPE={AUDIOS_TYPE}
				onChange={(e) => {
					const file = e.target.files[0];

					if (!file) return;
					setValue("audio.fileName", file.name);
				}}
				setError={setError}
				error={errors.audio?.blob?.message.toString()}
			/>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					isLoading={isLoading}
					theme="blue-light"
					className="hover:bg-blue-600 w-28"
				>
					Salvar
				</Button>
				<Button
					onClick={() => setContentItem(undefined)}
					theme="danger"
					className="w-28"
				>
					Cancelar
				</Button>
			</div>
		</form>
	);
};

export default Form;

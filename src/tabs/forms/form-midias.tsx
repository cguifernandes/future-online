import { useEffect, useState } from "react";
import Input from "../components/input";
import Button from "../components/button";
import File from "../components/file";
import Textarea from "../components/textarea";
import {
	ACCEPT_FILES_TYPE,
	FILES_TYPE,
	removeItem,
	storeBlobInIndexedDB,
} from "../../utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Midia } from "../../type/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Midia[];
		}>
	>;
	setContentItem: React.Dispatch<React.SetStateAction<Midia>>;
	contentItem: Midia;
}

const Form = ({ setContentItem, setData, contentItem }: Props) => {
	const [isLoading, setIsLoading] = useState(false);

	const schema = z.object({
		title: z.string(),
		file: z.object({
			subtitle: z.string().optional(),
			blob: z.instanceof(Blob).optional(),
			type: z.enum(["", "Imagem", "Vídeo"]).optional(),
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
			file: {
				blob: undefined,
				subtitle: "" || contentItem.file.subtitle,
				type: "" || contentItem.file.type,
			},
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			file: {
				blob: undefined,
				subtitle: "" || contentItem.file.subtitle,
				type: "" || contentItem.file.type,
			},
		});
	}, [contentItem, reset]);

	const handlerSubmit = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			let url = "";
			let preview = undefined;

			if (formData.file && formData.file.blob) {
				const blobId = await storeBlobInIndexedDB(formData.file.blob);
				const blobUrl = URL.createObjectURL(formData.file.blob);

				url = blobUrl;
				preview = blobId;
			}

			const updatedItem: Midia = {
				...contentItem,
				title: formData.title,
				file: {
					subtitle: formData.file.subtitle,
					url,
					preview,
					type: formData.file.type,
				},
			};

			chrome.storage.sync.get("midias", (result) => {
				const updatedItems = result.midias.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ midias: updatedItems }, () => {
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
					className="w-full flex-1"
					name="title"
					patternClassName="flex-1"
					theme="green"
					maxLength={24}
				/>
				<button
					type="button"
					onClick={async () => {
						setData({ itens: await removeItem(contentItem, "midias") });
						setContentItem(undefined);
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<Trash2 color="#fff" size={24} strokeWidth={1.5} />
				</button>
			</div>
			<div className="flex gap-x-3 w-full flex-1">
				<File
					FILES_TYPE={FILES_TYPE}
					ACCEPT_FILES_TYPE={ACCEPT_FILES_TYPE}
					contentItem={contentItem}
					onChange={(e) => {
						const file = e.target.files[0];
						if (!file) return;

						const blob = new Blob([file], { type: file.type });

						setValue("file.blob", blob);
						setValue(
							"file.type",
							file
								? file.type.includes("video")
									? "Vídeo"
									: "Imagem"
								: contentItem.file.type,
						);
					}}
					name="file.blobUrl"
					setError={setError}
					error={errors.file?.blob.message}
				/>
				<Textarea
					name="subtitle"
					theme="green"
					className="resize-none"
					placeholder="Insira uma legenda para a mídia (Opcional)"
					{...register("file.subtitle")}
				/>
			</div>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					isLoading={isLoading}
					theme="green-light"
					className="hover:bg-green-600 w-28"
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

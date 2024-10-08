import { useEffect, useState } from "react";
import Input from "../components/input";
import Button from "../components/button";
import File from "../components/file";
import Textarea from "../components/textarea";
import {
	ACCEPT_FILES_TYPE,
	FILES_TYPE,
	removeItem,
	sanitizeFileName,
	storeBlobInIndexedDB,
	uploadFileOnS3,
} from "../../utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Midia } from "../../type/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../components/spinner";

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
	const [isLoadingRemove, setIsLoadingRemove] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const schema = z.object({
		title: z.string(),
		file: z.object({
			subtitle: z.string().optional(),
			blob: z
				.instanceof(Blob, {
					message: "Arquivo inválido",
				})
				.refine(
					(value) =>
						value.type.startsWith("image") ||
						value.type.startsWith("video") ||
						value.type.startsWith("application/pdf"),
					{
						message: "Arquivo inválido",
					},
				)
				.refine((value) => value.size < 3 * 1024 * 1024 * 1024, {
					message: "Tamanho do arquivo excedeu 3 GB",
				})
				.optional(),
			fileName: z.string().optional(),
			type: z.enum(["", "Imagem", "Vídeo", "Documento"]).optional(),
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
			title: "Novo conteúdo" || contentItem.title,
			file: {
				blob: undefined,
				subtitle: "" || contentItem.file?.subtitle,
				type: "" || contentItem.file.type,
			},
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			file: {
				blob: undefined,
				subtitle: "" || contentItem.file?.subtitle,
				type: "" || contentItem.file.type,
			},
		});
	}, [contentItem, reset]);

	const handlerSubmit = async (formData: z.infer<typeof schema>) => {
		setIsLoading(true);

		try {
			let url = "";
			let preview = "";

			if (formData.file && formData.file.blob) {
				const fileName = `${new Date().getTime().toString()}-${sanitizeFileName(
					formData.file.fileName,
				)}`;

				if (formData.file.type === "Documento") {
					preview = formData.file.fileName;
				} else {
					const blobId = await storeBlobInIndexedDB(formData.file.blob);
					preview = blobId;
				}

				const fileUrl = await uploadFileOnS3(formData.file.blob, fileName);
				url = fileUrl;
			}

			const updatedItem: Midia = {
				...contentItem,
				title: formData.title,
				file: {
					subtitle: formData.file.subtitle,
					url: url !== "" ? url : contentItem.file.url,
					preview: preview !== "" ? preview : contentItem.file.preview,
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
		} catch (e) {
			console.log(e);
			toast.error("Falha ao salvar alterações", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#E53E3E]",
				duration: 5000,
			});
			return;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmit)}
			className="flex flex-col gap-y-3 items-center justify-between p-4 h-full"
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
						try {
							setIsLoadingRemove(true);
							setData({ itens: await removeItem(contentItem, "midias") });
						} finally {
							setContentItem(undefined);
							setIsLoadingRemove(false);
						}
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					{isLoadingRemove ? (
						<Spinner />
					) : (
						<Trash2 color="#fff" size={24} strokeWidth={1.5} />
					)}
				</button>
			</div>
			<div className="flex gap-x-3 w-full flex-1 mb-auto max-h-[232px]">
				<File
					FILES_TYPE={FILES_TYPE}
					ACCEPT_FILES_TYPE={ACCEPT_FILES_TYPE}
					contentItem={contentItem}
					onChange={(e) => {
						const file = e.target.files[0];

						const blob = new Blob([file], { type: file.type });
						const fileType = file
							? file.type.includes("video")
								? "Vídeo"
								: file.type.includes("image")
									? "Imagem"
									: "Documento"
							: "Documento";

						setValue("file.blob", blob);
						setValue("file.fileName", file.name);
						setValue("file.type", fileType);
					}}
					name="file.blobUrl"
					setError={setError}
					error={errors.file?.blob.message}
				/>
				<Textarea
					name="subtitle"
					theme="green"
					className="resize-none h-full"
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

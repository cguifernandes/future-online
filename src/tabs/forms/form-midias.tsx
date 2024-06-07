import React, { useEffect } from "react";
import Input from "../components/input";
import Button from "../components/button";
import File from "../components/file";
import Textarea from "../components/textarea";
import {
	generateThumbnail,
	removeItem,
	uploadAndSign,
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
	const [isLoading, setIsLoading] = React.useState(false);

	const schema = z.object({
		title: z.string(),
		image: z.object({
			subtitle: z.string(),
			file: z.any().optional(),
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
			image: {
				subtitle: contentItem.image.subtitle,
				file: undefined,
			},
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			image: {
				subtitle: contentItem.image.subtitle,
				file: undefined,
			},
		});
	}, [contentItem, reset]);

	const handlerSubmit = async ({ image, title }: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			const promises = [];

			if (image?.file) {
				const fileName = `${new Date().getTime()}${image.file.name}`;

				if (image.file.type.includes("video")) {
					const thumbnailBlob = await generateThumbnail(image.file);

					promises.push(uploadAndSign(`preview-${fileName}`, thumbnailBlob));
				}

				promises.push(uploadAndSign(fileName, image.file));
			}

			const [preview, url] = await Promise.all(promises);
			const hasImage = preview === undefined && url === undefined;

			const updatedItem: Midia = {
				...contentItem,
				title,
				image: {
					subtitle: image.subtitle,
					url: hasImage ? contentItem.image.url : url || preview,
					preview: hasImage ? contentItem.image.preview : preview,
					type: image.file
						? image.file.type.includes("video")
							? "Vídeo"
							: "Imagem"
						: contentItem.image.type,
				},
			};

			chrome.storage.sync.get("midias", (result) => {
				const updatedItems = result.midias.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ midias: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
					toast.success("Alterações salvas com sucesso!", {
						position: "bottom-right",
						className: "text-base ring-2 ring-[#1F2937]",
					});
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
					name="title"
					theme="green"
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
					contentItem={contentItem}
					setValue={setValue}
					name="image.file"
					setError={setError}
					error={errors.image?.file.message.toString()}
				/>
				<Textarea
					name="subtitle"
					theme="green"
					className="resize-none"
					placeholder="Insira uma legenda para a mídia (Opcional)"
					{...register("image.subtitle")}
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

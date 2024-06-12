// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect } from "react";
import Input from "../components/input";
import Textarea from "../components/textarea";
import Button from "../components/button";
import type { Mensagem } from "../../type/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { removeItem } from "../../utils/utils";
import toast from "react-hot-toast";

interface Props {
	contentItem: Mensagem;
	setContentItem: React.Dispatch<React.SetStateAction<Mensagem>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Mensagem[];
		}>
	>;
}

const Form = ({ contentItem, setContentItem, setData }: Props) => {
	const schema = z.object({
		title: z.string(),
		content: z.string(),
	});

	const { handleSubmit, register, reset } = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: "Novo contéudo" || contentItem.title,
			content: "Novo item" || contentItem.content,
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			content: contentItem.content,
		});
	}, [contentItem, reset]);

	const handlerSubmit = ({ content, title }: z.infer<typeof schema>) => {
		if (contentItem) {
			const updatedItem = { ...contentItem, title, content };

			chrome.storage.sync.get("mensagens", (result) => {
				const mensagens = result.mensagens || [];
				const updatedItems = mensagens.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ mensagens: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
					toast.success("Alterações salvas com sucesso!", {
						position: "bottom-right",
						className: "text-base ring-2 ring-[#1F2937]",
					});
				});
			});
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmit)}
			className="flex flex-col gap-y-3 items-center justify-center p-4 h-full"
		>
			<div className="flex gap-x-3 w-full">
				<Input
					placeholder="Título do item"
					{...register("title")}
					className="w-full"
					name="title"
					theme="purple"
					maxLength={24}
				/>
				<button
					type="button"
					onClick={async () => {
						setData({ itens: await removeItem(contentItem, "mensagens") });
						setContentItem(undefined);
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<Trash2 color="#fff" size={24} strokeWidth={1.5} />
				</button>
			</div>
			<Textarea
				name="content"
				placeholder="Conteúdo do item"
				className="h-full w-full resize-none"
				theme="purple"
				{...register("content")}
			/>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					type="submit"
					theme="purple-light"
					className="hover:bg-purple-600 w-28"
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

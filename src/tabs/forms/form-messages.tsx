// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect } from "react";
import Input from "../components/input";
import Textarea from "../components/textarea";
import Button from "../components/button";
import type { Message } from "../../type/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
	contentItem: Message;
	setContentItem: React.Dispatch<React.SetStateAction<Message>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Message[];
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
				});
			});
		}
	};

	const handlerRemoveItem = (removeItem: Message) => {
		chrome.storage.sync.get("mensagens", (result) => {
			const mensagens = result.mensagens || [];
			const updatedItems = mensagens.filter(
				(item: { title: string; content: string; id: string }) =>
					item.id !== removeItem.id,
			);

			chrome.storage.sync.set({ mensagens: updatedItems }, () => {
				setData({ itens: updatedItems });
				setContentItem(undefined);
			});
		});
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
				/>
				<button
					type="button"
					onClick={() => handlerRemoveItem(contentItem)}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-white"
					>
						<title>Remover</title>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						<line x1="10" x2="10" y1="11" y2="17" />
						<line x1="14" x2="14" y1="11" y2="17" />
					</svg>
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
				<Button theme="purple-light" className="hover:bg-purple-600 w-28">
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

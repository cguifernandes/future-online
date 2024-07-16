import { useEffect, useState } from "react";
import Input from "../components/input";
import Textarea from "../components/textarea";
import Button from "../components/button";
import type { Mensagem } from "../../type/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import {
	deleteItemDatabase,
	getUserIdWithToken,
	putItemDatabase,
	removeItem,
} from "../../utils/utils";
import toast from "react-hot-toast";
import Spinner from "../components/spinner";

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
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingRemove, setIsLoadingRemove] = useState(false);
	const schema = z.object({
		title: z.string(),
		content: z.string(),
	});

	const { handleSubmit, register, reset } = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: "Novo conteúdo" || contentItem.title,
			content: "Novo item" || contentItem.content,
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			content: contentItem.content,
		});
	}, [contentItem, reset]);

	const handlerSubmit = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			const clientId = await getUserIdWithToken();
			await putItemDatabase(
				"mensagem",
				JSON.stringify({
					id: contentItem.databaseId,
					clientId: clientId.id,
					newMensagem: formData,
				}),
			);

			const updatedItem = {
				...contentItem,
				title: formData.title,
				content: formData.content,
			};

			chrome.storage.sync.get("mensagens", (result) => {
				const mensagens = result.mensagens || [];
				const updatedItems = mensagens.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ mensagens: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem((prev) => ({
						...prev,
						...updatedItem,
					}));
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
			className="flex flex-col gap-y-3 items-center justify-center p-4 h-full"
		>
			<div className="flex gap-x-3 w-full">
				<Input
					placeholder="Título do item"
					{...register("title")}
					className="w-full flex-1"
					patternClassName="flex-1"
					name="title"
					theme="purple"
					maxLength={24}
				/>
				<button
					type="button"
					onClick={async () => {
						try {
							setIsLoading(true);
							const clientId = await getUserIdWithToken();

							deleteItemDatabase(
								"mensagem",
								clientId.id,
								contentItem.databaseId,
							).catch((e) => {
								console.log(e);
								toast.error("Falha ao salvar alterações", {
									position: "bottom-right",
									className: "text-base ring-2 ring-[#E53E3E]",
									duration: 5000,
								});
								setIsLoadingRemove(false);
								return;
							});

							setData({ itens: await removeItem(contentItem, "mensagens") });
							setContentItem(undefined);
						} finally {
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
					isLoading={isLoading}
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

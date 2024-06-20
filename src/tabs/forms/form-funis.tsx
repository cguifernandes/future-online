import React, { useEffect, useState } from "react";
import Input from "../components/input";
import type { Funil, Mensagem, Midia } from "../../type/type";
import Button from "../components/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFunilItem, removeItem } from "../../utils/utils";
import { Image, Mail, Mic, Plus, Timer, Trash2 } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

interface Props {
	contentItem: Funil;
	setContentItem: React.Dispatch<React.SetStateAction<Funil>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Funil[];
		}>
	>;
	setVisibleModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Form = ({
	contentItem,
	setContentItem,
	setVisibleModal,
	setData,
}: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingItem, setIsLoadingItem] = useState(false);
	const [dataItem, setDataItem] = useState<{
		data: {
			item: Midia | Mensagem;
			type: "" | "Mensagens" | "Mídias";
			delay: {
				minutes: number;
				seconds: number;
			};
		}[];
		totalSeconds: number;
		totalMinutes: number;
	}>({ totalMinutes: 0, totalSeconds: 0, data: [] });

	useEffect(() => {
		if (contentItem.item) {
			setIsLoadingItem(true);

			getFunilItem(contentItem.item)
				.then((data) => {
					let totalMinutes = 0;
					let totalSeconds = 0;

					for (const item of data) {
						totalMinutes += item.delay.minutes;
						totalSeconds += item.delay.seconds;
					}

					setDataItem({ data, totalMinutes, totalSeconds });
				})
				.catch((error) => {
					console.log(error);
				})
				.finally(() => {
					setIsLoadingItem(false);
				});
		} else {
			setDataItem({ totalMinutes: 0, totalSeconds: 0, data: [] });
		}
	}, [contentItem]);

	const schema = z.object({
		title: z.string(),
	});

	const { handleSubmit, register, reset } = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: "Novo funil" || contentItem.title,
		},
	});

	useEffect(() => {
		reset({ ...contentItem });
	}, [contentItem, reset]);

	const handlerSubmit = ({ title }: z.infer<typeof schema>) => {
		try {
			const updatedItem: Funil = { ...contentItem, title };

			chrome.storage.sync.get("funis", (result) => {
				const funis = result.funis || [];
				const updatedItems: Funil[] = funis.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ funis: updatedItems }, () => {
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

	const handlerRemoveFunilItem = (index: number) => {
		chrome.storage.sync.get("funis", (result) => {
			const funis: Funil[] = result.funis || [];
			const funil = funis.find((i) => i.id === contentItem.id);

			if (funil) {
				funil.item.splice(index, 1);

				chrome.storage.sync.set({ funis }, () => {
					setData({ itens: funis });
					setContentItem((prev) => ({
						...prev,
						item: funil.item,
					}));
				});
			}
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
					className="w-full"
					name="title"
					theme="yellow"
					maxLength={24}
					{...register("title")}
				/>
				<button
					type="button"
					onClick={async () => {
						setData({ itens: await removeItem(contentItem, "funis") });
						setContentItem(undefined);
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<Trash2 size={24} color="#fff" strokeWidth={1.5} />
				</button>
			</div>
			{dataItem.data.length > 0 ? (
				<div className="flex flex-col w-full flex-1 h-full">
					<div className="flex gap-x-3 items-center w-full justify-between pb-3">
						<div className="flex flex-col gap-y-px">
							<span className="text-white text-base">
								Itens adicionados:{" "}
								<b className="text-yellow-600">{dataItem.data.length}</b>
							</span>
							<span className="text-white text-sm">
								Tempo total:{" "}
								<b className="text-yellow-600">
									{dataItem.totalMinutes} min {dataItem.totalSeconds} s
								</b>
							</span>
						</div>
						<Button
							type="button"
							onClick={() => setVisibleModal(true)}
							theme="yellow-dark"
							icon={<Plus size={18} color="#fff" />}
						>
							Adicionar novo item
						</Button>
					</div>
					<div className="flex flex-col gap-y-3 flex-1 overflow-y-auto max-h-[188px]">
						{isLoadingItem ? (
							<span className="text-white">Carregando...</span>
						) : (
							dataItem.data.map((item, index) => (
								<div
									key={index}
									className={clsx(
										"px-4 py-3 flex items-center gap-x-3 rounded-lg",
										item.type === "Mensagens"
											? "bg-purple-900/90"
											: item.type === "Mídias"
												? "bg-green-800/90"
												: "bg-blue-800/90",
									)}
								>
									{item.type === "Mensagens" ? (
										<Mail color="#fff" size={24} strokeWidth={1.5} />
									) : item.type === "Mídias" ? (
										<Image color="#fff" size={24} strokeWidth={1.5} />
									) : (
										<Mic color="#fff" size={24} strokeWidth={1.5} />
									)}
									<span className="text-white text-base">{item.type}</span>

									<div className="flex gap-x-3 items-center ml-auto">
										<span className="text-white gap-x-1 flex items-center text-sm">
											<Timer size={20} />
											{item.delay.minutes > 0 && `${item.delay.minutes}m`}{" "}
											{item.delay.seconds > 0 && `${item.delay.seconds}s`}
										</span>
										<button
											type="button"
											onClick={() => handlerRemoveFunilItem(index)}
											className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg transition-all bg-red-600 hover:bg-red-700"
										>
											<Trash2 color="#fff" size={20} strokeWidth={1.5} />
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			) : (
				<div className="flex-1 h-full flex flex-col items-center justify-center gap-y-3 max-w-md">
					<p className="text-center text-white text-base">
						Você ainda não possui nenhum item adicionado neste funil. Caso
						queira adicionar um item clique no botão abaixo
					</p>
					<Button
						type="button"
						onClick={() => setVisibleModal(true)}
						theme="yellow-dark"
						icon={<Plus size={18} color="#fff" />}
					>
						Adicionar primeiro item
					</Button>
				</div>
			)}
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					isLoading={isLoading}
					type="submit"
					theme="yellow-light"
					className="hover:bg-yellow-600 w-28"
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

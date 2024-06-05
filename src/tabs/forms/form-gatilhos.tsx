// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Funil, Gatilho } from "../../type/type";
import Input from "../components/input";
import { getItem, removeItem } from "../../utils/utils";
import { Trash2 } from "lucide-react";
import Button from "../components/button";
import Select from "../components/select";
import Switch from "../components/switch";

interface Props {
	contentItem: Gatilho;
	setContentItem: React.Dispatch<React.SetStateAction<Gatilho>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Gatilho[];
		}>
	>;
}

const Form = ({ contentItem, setContentItem, setData }: Props) => {
	const [selectedFunil, setSelectedFunil] = useState("");
	const [visibleDropdown, setVisibleDropdown] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [funis, setFunis] = useState<{
		itens: Funil[];
	}>({ itens: [] });

	const schema = z.object({
		title: z.string({ required_error: "Este campo é obrigátorio" }),
		delay: z
			.number({ required_error: "Este campo é obrigátorio" })
			.refine((value) => value !== 0, "Os segundos não podem ser 0.")
			.refine(
				(value) => value >= 0 && value <= 60,
				"Os segundos não podem ser maior que 60.",
			),
		saveContacts: z.boolean(),
		sendGroups: z.boolean(),
		ignoreCase: z.boolean(),
		funilId: z.string({ required_error: "Este campo é obrigátorio" }),
	});

	const {
		handleSubmit,
		register,
		reset,
		setValue,
		control,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: contentItem.title || "Novo gatilho",
			delay: contentItem.delay || 0,
			saveContacts: contentItem.saveContacts || false,
			sendGroups: contentItem.sendGroups || false,
			ignoreCase: contentItem.ignoreCase || false,
			funilId: contentItem.funilId || "",
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			delay: contentItem.delay,
			saveContacts: contentItem.saveContacts,
			sendGroups: contentItem.sendGroups,
			ignoreCase: contentItem.ignoreCase,
			funilId: contentItem.funilId,
		});
	}, [contentItem, reset]);

	useEffect(() => {
		setIsLoading(true);

		if (visibleDropdown) {
			getItem<Funil>("funis")
				.then((data) => {
					const selectedFunil = data.filter((funil) => funil.item);
					setFunis({ itens: selectedFunil });
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [visibleDropdown]);

	const handlerSubmit = (data: z.infer<typeof schema>) => {
		if (contentItem) {
			const updatedItem = { ...contentItem, ...data };

			chrome.storage.sync.get("gatilhos", (result) => {
				const gatilhos = result.gatilhos || [];
				const updatedItems = gatilhos.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ gatilhos: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
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
					theme="orange"
					error={errors.title?.message}
				/>
				<button
					type="button"
					onClick={async () => {
						setData({ itens: await removeItem(contentItem, "gatilhos") });
						setContentItem(undefined);
					}}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					<Trash2 color="#fff" size={24} strokeWidth={1.5} />
				</button>
			</div>
			<div className="flex-1 flex-col gap-y-2 h-full w-full">
				<div className="flex gap-x-2 items-center">
					<div className="flex flex-col gap-y-2 max-w-xs w-full">
						<div className="flex items-center gap-x-2 w-full">
							<label className="text-white break-words text-sm">
								Funil a ser disparado:
							</label>
							<Select
								visibleDropdown={visibleDropdown}
								setVisibleDropdown={setVisibleDropdown}
								options={funis.itens.map((funil) => ({
									title: funil.title,
									id: funil.id,
								}))}
								selectedValue={selectedFunil}
								setSelectedValue={setSelectedFunil}
								size="small"
								isLoading={isLoading}
								setValue={setValue}
								name="funilId"
								error={errors.funilId?.message}
							/>
						</div>
						<div className="flex items-center gap-x-2 w-full">
							<label className="text-white break-words text-sm">
								Atraso antes do envio em segundos:
							</label>
							<Input
								{...register("delay", {
									valueAsNumber: true,
								})}
								className="w-36 text-center"
								error={errors.delay?.message}
							/>
						</div>
					</div>
					<div className="flex-1 h-full w-full flex flex-col gap-y-2">
						<Switch
							name="saveContacts"
							control={control}
							label="Não enviar p/ contatos salvos"
						/>
						<Switch
							name="sendGroups"
							control={control}
							label="Não enviar p/ grupos"
						/>
						<Switch
							name="ignoreCase"
							control={control}
							label="Ignorar maiúsculos e minúsculos"
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					type="submit"
					theme="orange-light"
					className="hover:bg-orange-600 w-28"
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

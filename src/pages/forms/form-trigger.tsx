import { Trash2 } from "lucide-react";
import Button from "../components/button";
import Input from "../components/input";
import { Trigger } from "../../type/type";
import Tabs from "../components/tabs";
import SaveContacts from "../Trigger/saveContacts";
import NotSaveContacts from "../Trigger/notSaveContacts";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { removeItem } from "../../utils/utils";
import Spinner from "../components/spinner";

type Props = {
	contentItem: Trigger;
	setContentItem: React.Dispatch<React.SetStateAction<Trigger>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Trigger[];
		}>
	>;
};

const Form = ({ contentItem, setContentItem, setData }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingRemove, setIsLoadingRemove] = useState(false);
	const schema = z.object({
		title: z.string(),
		trigger: z.object({
			type: z.enum(["saveContacts", "notSaveContacts"]),
			message: z
				.string({ required_error: "Este campo é obrigatório" })
				.min(1, "Este campo é obrigatório"),
			delay: z.object({
				value1: z
					.number()
					.min(5, "O valor mínimo é 5")
					.max(15, "O valor máximo é 15"),
				value2: z
					.number()
					.min(5, "O valor mínimo é 5")
					.max(15, "O valor máximo é 15"),
			}),
			phones: z
				.union([
					z.string().min(1, "Este campo é obrigatório"),
					z.array(z.string().min(1, "Este campo é obrigatório")),
				])
				.refine(
					(value) =>
						typeof value === "string"
							? value.includes(",")
							: Array.isArray(value),
					{
						message: "Cada telefone deve ser separado por vírgula",
					},
				)
				.transform((value) =>
					typeof value === "string"
						? value.split(",").map((phone) => phone.trim().replace("@c.us", ""))
						: value.map((phone) => phone.trim().replace("@c.us", "")),
				)
				.superRefine((value, ctx) => {
					const phonesArray = Array.isArray(value) ? value : [value];
					const regex = /^\+55\d{2}\d{8,9}$/;
					const uniquePhones = new Set();
					let duplicatedPhone: string | null = null;

					phonesArray.forEach((phone) => {
						if (!regex.test(phone)) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message:
									"O telefone deve estar no formato: +55(DDI)(DDD)XXXXXXXX. Exemplo: +5521976444731",
							});
						}
						if (uniquePhones.has(phone)) {
							duplicatedPhone = phone;
						}
						uniquePhones.add(phone);
					});

					if (duplicatedPhone) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `O telefone ${duplicatedPhone} está duplicado`,
						});
					}
				}),
		}),
	});

	const {
		handleSubmit,
		register,
		setValue,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			title: contentItem.title,
			trigger: {
				type: contentItem.trigger.type,
				phones: contentItem.trigger?.phones ?? [""],
				message: contentItem.trigger?.message ?? "",
				delay: {
					value1: contentItem.trigger.delay?.value1,
					value2: contentItem.trigger.delay?.value2,
				},
			},
		},
	});

	useEffect(() => {
		reset({
			title: contentItem.title,
			trigger: {
				...contentItem.trigger,
				phones: contentItem.trigger?.phones ?? [""],
				message: contentItem.trigger?.message ?? "",
			},
		});
	}, [contentItem, reset]);

	const handlerSubmitTrigger = (formData: z.infer<typeof schema>) => {
		setIsLoading(true);

		try {
			const updatedItem: Trigger = {
				...contentItem,
				...formData,
			};

			chrome.storage.sync.get("triggers", (result: { triggers: Trigger[] }) => {
				const triggers = result.triggers || [];
				const updatedItems = triggers.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ triggers: updatedItems }, () => {
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
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmitTrigger)}
			className="flex flex-col overflow-y-auto gap-y-3 justify-between p-4 h-full"
		>
			<div className="flex gap-x-3 w-full">
				<Input
					placeholder="Título do item"
					className="w-full flex-1"
					patternClassName="flex-1"
					name="title"
					theme="pink"
					maxLength={24}
					{...register("title")}
				/>
				<button
					type="button"
					onClick={async () => {
						try {
							setIsLoading(true);

							setData({ itens: await removeItem(contentItem, "triggers") });
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
			<div className="flex-1 w-full">
				<Tabs
					onChange={(tab) => {
						setValue("trigger.type", tab as "saveContacts" | "notSaveContacts");
						reset();
					}}
					contentItem={contentItem}
					contents={[
						<SaveContacts
							contentItem={contentItem}
							errors={errors}
							register={register}
							setValue={setValue}
							key={1}
						/>,
						<NotSaveContacts
							contentItem={contentItem}
							errors={errors}
							register={register}
							setValue={setValue}
							key={2}
						/>,
					]}
					tabs={["Contantos salvos", "Contantos não salvos"]}
				/>
			</div>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button
					type="submit"
					theme="pink-light"
					isLoading={isLoading}
					className="hover:bg-pink-700 w-28"
				>
					Salvar
				</Button>
				<Button theme="danger" className="w-28">
					Cancelar
				</Button>
			</div>
		</form>
	);
};

export default Form;

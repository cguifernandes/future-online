import { useEffect, useState } from "react";
import Item from "../components/item";
import Select from "../components/select";
import type { Audio, Funil, Mensagem, Midia } from "../../type/type";
import Input from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/button";
import { Image, Mail, Mic } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
	setVisibleModal: React.Dispatch<React.SetStateAction<boolean>>;
	content: Funil;
	setContentItem: React.Dispatch<React.SetStateAction<Funil>>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Funil[];
		}>
	>;
}

const Form = ({ setVisibleModal, content, setContentItem, setData }: Props) => {
	const [options, setOptions] = useState<{ title: string; id: string }[]>([]);
	const [selectedItem, setSelectedItem] = useState<{
		index: number;
		title?: string;
	}>({ index: 0, title: "Mensagens" });

	const itens = [
		{
			title: "Mensagens",
			icon: <Mail size={32} strokeWidth={1.5} />,
			color: "bg-purple-900/90",
		},
		{
			title: "Mídias",
			icon: <Image size={32} strokeWidth={1.5} />,
			color: "bg-green-800/90",
		},
		{
			title: "Áudios",
			icon: <Mic size={32} strokeWidth={1.5} />,
			color: "bg-blue-800/90",
		},
	];

	const schema = z.object({
		type: z.enum(["Mensagens", "Mídias", "Áudios"]),
		selectedId: z.string({ required_error: "Este campo é obrigatório." }),
		delay: z
			.object({
				minutes: z
					.number()
					.refine(
						(value) => value >= 0 && value <= 5,
						"Os minutos não podem ser maior que 5.",
					),
				seconds: z
					.number()
					.refine(
						(value) => value >= 0 && value <= 60,
						"Os segundos não podem ser maior que 60.",
					),
			})
			.refine(
				(data) => data.minutes !== 0 || data.seconds !== 0,
				"Os valores não podem ser 0",
			),
	});

	const {
		handleSubmit,
		register,
		setValue,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			type: "Mensagens",
			delay: {
				minutes: 0,
				seconds: 0,
			},
		},
	});

	const handlerSubmit = ({
		delay,
		selectedId,
		type,
	}: z.infer<typeof schema>) => {
		chrome.storage.sync.get("funis", (result) => {
			const funis = result.funis || [];
			let updatedItem: Funil;

			const updatedFunis = funis.map((funil) => {
				if (funil.id === content.id) {
					const newItem = { delay, selectedId, type };

					const updatedItems = Array.isArray(funil.item)
						? [...funil.item, newItem]
						: [newItem];

					updatedItem = { ...funil, item: updatedItems };

					return updatedItem;
				}
				return funil;
			});

			chrome.storage.sync.set({ funis: updatedFunis }, () => {
				setData({ itens: updatedFunis });
				setContentItem(updatedItem);
				setVisibleModal(false);
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
	};

	useEffect(() => {
		chrome.storage.sync
			.get(
				selectedItem.title
					.toLocaleLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, ""),
			)
			.then(
				(result: {
					mensagens: Mensagem[];
					midias: Midia[];
					audios: Audio[];
				}) => {
					let options = [];
					if (selectedItem.title === "Mensagens" && result.mensagens) {
						options = result.mensagens
							.filter((value) => value.content !== "")
							.map(({ id, title }) => ({ id, title }));
					} else if (selectedItem.title === "Mídias" && result.midias) {
						options = result.midias
							.filter((value) => value.file.preview !== "")
							.map(({ id, title }) => ({ id, title }));
					} else if (selectedItem.title === "Áudios" && result.audios) {
						options = result.audios
							.filter((value) => value.audio.url !== "")
							.map(({ id, title }) => ({ id, title }));
					}
					setOptions(options);
				},
			)
			.catch((error) => {
				console.log(error);
			});
	}, [selectedItem]);

	return (
		<form
			onSubmit={handleSubmit(handlerSubmit)}
			className="flex flex-col gap-y-3"
		>
			<div className="flex justify-between items-center w-full">
				<h1 className="text-white text-xl py-3">Adicionar novo item</h1>
				<button
					className="p-3 w-8 h-8 bg-red-600/30 flex items-center justify-center transition-all text-white rounded-full hover:bg-red-600"
					type="button"
					onClick={() => setVisibleModal(false)}
				>
					X
				</button>
			</div>
			<div className="flex flex-col gap-y-2">
				<label className="text-lg text-white">Tipo:</label>
				<ul className="flex justify-between gap-x-3">
					{itens.map((item, index) => (
						<Item
							color={item.color}
							key={item.title}
							className="flex-1 flex-col flex h-36 rounded-lg"
							classNameButton="transition-all p-4 rounded-lg text-white w-full cursor-pointer h-full flex items-center justify-center"
							setContent={setSelectedItem}
							contentDashboard={selectedItem}
							title={item.title}
							setValue={setValue}
							name="type"
							index={index}
						>
							<div className="flex flex-col justify-center items-center">
								<div className="p-4 rounded-lg transition-all bg-black/40 text-white">
									{item.icon}
								</div>
								<span className="text-base font-semibold text-white">
									{item.title}
								</span>
							</div>
						</Item>
					))}
				</ul>
			</div>
			<Select
				label="Item:"
				options={options}
				setValue={setValue}
				name="selectedId"
				error={errors.selectedId?.message}
			/>
			<div className="flex flex-col gap-y-2">
				<label className="text-lg text-white">Delay:</label>
				<div className="flex items-center justify-between gap-x-4">
					<div className="flex flex-col gap-y-2 flex-1">
						<span className="text-center text-base text-white">Minutos</span>
						<Input
							type="number"
							className="w-full text-center"
							{...register("delay.minutes", {
								valueAsNumber: true,
							})}
							error={errors.delay?.minutes?.message}
						/>
					</div>
					<span className="text-2xl text-white">:</span>
					<div className="flex flex-col gap-y-2 flex-1">
						<span className="text-center text-base text-white">Segundos</span>
						<Input
							type="number"
							className="w-full text-center"
							{...register("delay.seconds", {
								valueAsNumber: true,
							})}
							error={errors.delay?.seconds?.message}
						/>
					</div>
				</div>
				{errors.delay?.root?.message && (
					<span className="text-red-600 text-sm">
						{errors.delay?.root?.message}
					</span>
				)}
			</div>
			<Button className="bg-black/30" type="submit">
				Salvar
			</Button>
		</form>
	);
};

export default Form;

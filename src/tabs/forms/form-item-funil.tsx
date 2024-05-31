// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect, useState } from "react";
import Item from "../components/item";
import Select from "../components/select";
import type { Funil, Message, Midia } from "../../type/type";
import Input from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/button";

const Form = ({
	setVisibleModal,
}: { setVisibleModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const [visibleDropdown, setVisibleDropdown] = useState(false);
	const [options, setOptions] = useState<{ title: string; id: string }[]>([]);
	const [selectedItem, setSelectedItem] = useState<{
		index: number;
		title?: string;
	}>({ index: 0, title: "Mensagens" });

	const itens = [
		{
			title: "Mensagens",
			icon: (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect width="20" height="16" x="2" y="4" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			),
			color: "bg-purple-900/90",
		},
		{
			title: "Mídias",
			icon: (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="lucide lucide-image"
				>
					<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
					<circle cx="9" cy="9" r="2" />
					<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
				</svg>
			),
			color: "bg-green-800/90",
		},
	];

	const schema = z.object({
		type: z.enum(["Mensagens", "Mídias"]),
		item: z.object({
			id: z.string(),
			title: z.string(),
		}),
		delay: z.object({
			minutes: z.number(),
			seconds: z.number(),
		}),
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

	const handlerSubmit = (data: z.infer<typeof schema>) => {
		console.log(data);
	};

	console.log(errors);

	useEffect(() => {
		chrome.storage.sync
			.get(
				selectedItem.title
					.toLocaleLowerCase()
					.normalize("NFD")
					// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
					.replace(/[\u0300-\u036f]/g, ""),
			)
			.then(
				(result: { mensagens: Message[]; midias: Midia[]; funis: Funil[] }) => {
					let options = [];
					if (selectedItem.title === "Mensagens" && result.mensagens) {
						options = result.mensagens.map(({ id, title }) => ({ id, title }));
					} else if (selectedItem.title === "Mídias" && result.midias) {
						options = result.midias.map(({ id, title }) => ({ id, title }));
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
				visibleDropdown={visibleDropdown}
				setVisibleDropdown={setVisibleDropdown}
				label="Item:"
				options={options}
				setValue={setValue}
				name="item.id"
			/>
			{visibleDropdown && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					className="absolute top-0 left-0 w-full h-full"
					onClick={() => setVisibleDropdown(false)}
				/>
			)}
			<div className="flex flex-col gap-y-2">
				<label className="text-lg text-white">Delay:</label>
				<div className="flex items-center justify-between gap-x-4">
					<div className="flex flex-col gap-y-2 flex-1">
						<span className="text-center text-base text-white">Minutos</span>
						<Input
							min={0}
							max={50}
							type="number"
							className="w-full text-center"
							{...register("delay.minutes", {
								valueAsNumber: true,
							})}
						/>
					</div>
					<span className="text-2xl text-white">:</span>
					<div className="flex flex-col gap-y-2 flex-1">
						<span className="text-center text-base text-white">Segundos</span>
						<Input
							min={0}
							max={50}
							type="number"
							className="w-full text-center"
							{...register("delay.seconds", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>
			</div>
			<Button className="bg-black/30" type="submit">
				Salvar
			</Button>
		</form>
	);
};

export default Form;

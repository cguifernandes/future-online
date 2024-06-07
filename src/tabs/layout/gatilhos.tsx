import React, { useEffect, useState } from "react";
import Button from "../components/button";
import type { Gatilho } from "../../type/type";
import clsx from "clsx";
import { addItem, getItem } from "../../utils/utils";
import { Plus } from "lucide-react";
import Form from "../forms/form-gatilhos";

const Gatilhos = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [contentItem, setContentItem] = useState<Gatilho>(undefined);
	const [data, setData] = useState<{
		itens: Gatilho[];
	}>({ itens: [] });

	useEffect(() => {
		setIsLoading(true);

		getItem<Gatilho>("gatilhos")
			.then((data) => {
				setData({ itens: data });
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-black/70 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-orange-500 rounded-tl-lg">
					Gerenciamento de Gatilhos
				</h1>
				{isLoading ? (
					<span className="text-center text-white text-base">
						Carrengando...
					</span>
				) : data.itens.length > 0 ? (
					<>
						<div className="flex flex-col max-h-60 overflow-y-auto">
							{data.itens.map((item, index) => (
								<Button
									inputSwitch
									switchDefaultValue={item.active}
									onSwitchChange={(e) => {
										const updatedItem = { ...item, active: e.target.checked };
										chrome.storage.sync.get("gatilhos", (result) => {
											const gatilhos = result.gatilhos || [];
											const updatedItems = gatilhos.map((i: Gatilho) =>
												i.id === item.id ? updatedItem : i,
											);

											chrome.storage.sync.set(
												{ gatilhos: updatedItems },
												() => {
													setData({ itens: updatedItems });
												},
											);
										});
									}}
									type="button"
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									theme="orange-dark"
									onClick={() => {
										setContentItem(item);
									}}
									className={clsx(
										"text-left !rounded-none hover:bg-orange-800/70 min-h-[48px]",
										contentItem &&
											item.id === contentItem.id &&
											"bg-orange-800/70",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="orange-dark"
								className="hover:bg-orange-800"
								onClick={() =>
									setData({
										itens: addItem<Gatilho>(
											{
												title: "Novo gatilho",
												type: "gatilhos",
												active: true,
												delay: 1,
												ignoreCase: false,
												saveContacts: false,
												sendGroups: false,
												funil: {
													id: undefined,
													name: undefined,
												},
												keywords: [],
											},
											data,
										),
									})
								}
								icon={<Plus size={18} color="#fff" />}
							>
								Novo item
							</Button>
						</div>
					</>
				) : (
					<div className="h-full w-full flex flex-col justify-center items-center">
						<div className="flex flex-col items-center gap-y-1 px-3">
							<span className="text-base text-white text-center">
								Nenhum item cadastrado ainda, clique no botão abaixo para
								adicionar seu primeiro item
							</span>
							<Button
								type="button"
								theme="orange-dark"
								onClick={() =>
									setData({
										itens: addItem<Gatilho>(
											{
												title: "Novo gatilho",
												type: "gatilhos",
												active: true,
												delay: 1,
												ignoreCase: false,
												saveContacts: false,
												sendGroups: false,
												funil: {
													id: undefined,
													name: undefined,
												},
												keywords: [],
											},
											data,
										),
									})
								}
								icon={<Plus size={18} color="#fff" />}
							>
								Novo item
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="relative w-full h-full bg-black/70 backdrop-blur rounded-r-lg border-l-2 border-white">
				{contentItem ? (
					<Form
						contentItem={contentItem}
						setContentItem={setContentItem}
						setData={setData}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione um gatilho para editar na aba ao lado ou clique em "Novo
							Item" para adicionar um novo gatilho
						</h1>
					</div>
				)}
			</div>
		</>
	);
};

export default Gatilhos;

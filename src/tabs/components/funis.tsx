import React, { useEffect, useState } from "react";
import Form from "../forms/form-funis";
import Button from "./button";
import clsx from "clsx";
import { v4 as uuidv4 } from "uuid";

const Funis = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<{
		itens: {
			title: string;
			item: {
				selectedId: string;
				delay: {
					minutes: number;
					seconds: number;
				};
			};
			id: string;
		}[];
	}>({ itens: [] });
	const [contentItem, setContentItem] = useState<{
		title: string;
		item: {
			selectedId: string;
			delay: {
				minutes: number;
				seconds: number;
			};
		};
		id: string;
	}>();
	const [dataItem, setDataItem] = useState<{
		title: string;
		item: {
			selectedId: string;
			delay: {
				minutes: number;
				seconds: number;
			};
		};
	}>({
		title: "",
		item: { selectedId: "", delay: { minutes: 0, seconds: 0 } },
	});

	useEffect(() => {
		setDataItem({
			title: contentItem?.title || "",
			item: {
				selectedId: contentItem?.item.selectedId || "",
				delay: {
					minutes: contentItem?.item.delay.minutes || 0,
					seconds: contentItem?.item.delay.seconds || 0,
				},
			},
		});
	}, [contentItem]);

	useEffect(() => {
		try {
			chrome.storage.sync
				.get()
				.then(({ funis }) => {
					setData({ itens: funis });
				})
				.catch((error) => {
					console.log(error);
				});
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handlerAddItem = (newItem: {
		title: string;
		item: {
			selectedId: string;
			delay: {
				minutes: number;
				seconds: number;
			};
		};
	}) => {
		const newItemWithId = { ...newItem, id: uuidv4() };
		const newItems = [...data.itens, newItemWithId];

		chrome.storage.sync.set({ funis: newItems }, () => {
			setData({ itens: newItems });
		});
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-black/70 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-yellow-500 rounded-tl-lg">
					Gerenciamento de Mídias
				</h1>
				{isLoading ? (
					<span className="text-center text-white text-base">
						Carrengando...
					</span>
				) : data.itens?.length > 0 ? (
					<>
						<div className="flex flex-col max-h-60 overflow-y-auto">
							{data.itens.map((item, index) => (
								<Button
									type="button"
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									theme="yellow-dark"
									onClick={() => {
										setContentItem(item);
									}}
									className={clsx(
										"text-left !rounded-none hover:bg-yellow-700 min-h-[48px]",
										contentItem &&
											item.id === contentItem.id &&
											"bg-yellow-700",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="yellow-dark"
								className="hover:bg-yellow-700"
								onClick={() =>
									handlerAddItem({
										title: "Novo funil",
										item: {
											selectedId: "",
											delay: { minutes: 0, seconds: 0 },
										},
									})
								}
								icon={
									// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M5 12h14" />
										<path d="M12 5v14" />
									</svg>
								}
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
								theme="yellow-dark"
								onClick={() =>
									handlerAddItem({
										title: "Novo funil",
										item: {
											selectedId: "",
											delay: { minutes: 0, seconds: 0 },
										},
									})
								}
								icon={
									// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M5 12h14" />
										<path d="M12 5v14" />
									</svg>
								}
							>
								Novo item
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="bg-black/70 rounded-r-lg border-l-2 border-white w-full h-full">
				{contentItem ? (
					<Form
						contentItem={contentItem}
						setContentItem={setContentItem}
						setData={setData}
						dataItem={dataItem}
						setDataItem={setDataItem}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione um funis para editar na aba ao lado ou clique em "Novo
							Item" para adicionar um novo funil
						</h1>
					</div>
				)}
			</div>
		</>
	);
};

export default Funis;

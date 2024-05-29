import React, { useEffect, useState } from "react";
import Button from "./button";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import Form from "../forms/form-midias";
import type { Midia } from "../../type/type";

const Midias = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<{
		itens: Midia[];
	}>({ itens: [] });
	const [dataItem, setDataItem] = useState<Midia>({
		title: "",
		image: { url: undefined, subtitle: "", preview: "", type: "" },
	});
	const [contentItem, setContentItem] = useState<Midia>();

	useEffect(() => {
		setDataItem({
			title: contentItem?.title || "",
			image: {
				url: contentItem?.image.url || "",
				subtitle: contentItem?.image.subtitle || "",
				preview: contentItem?.image.preview || "",
				type: contentItem?.image.type || "",
			},
		});
	}, [contentItem]);

	useEffect(() => {
		chrome.storage.sync
			.get()
			.then((result) => {
				const midias =
					Object.keys(result).length === 0 ? [] : result.midias || [];
				console.log(result);
				setData({ itens: midias });
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const handlerAddItem = (newItem: Midia) => {
		const newItemWithId = { ...newItem, id: uuidv4() };
		const newItems = [...data.itens, newItemWithId];

		chrome.storage.sync.set({ midias: newItems }, () => {
			setData({ itens: newItems });
		});
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-black/70 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-green-500 rounded-tl-lg">
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
									theme="green-dark"
									onClick={() => {
										setContentItem(item);
									}}
									className={clsx(
										"text-left !rounded-none hover:bg-green-700 min-h-[48px]",
										contentItem && item.id === contentItem.id && "bg-green-700",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="green-dark"
								className="hover:bg-green-700"
								onClick={() =>
									handlerAddItem({
										title: "Novo conteúdo",
										image: { url: "", subtitle: "", preview: "", type: "" },
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
								theme="green-dark"
								onClick={() =>
									handlerAddItem({
										title: "Novo conteúdo",
										image: { url: "", subtitle: "", preview: "", type: "" },
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
						dataItem={dataItem}
						setContentItem={setContentItem}
						setData={setData}
						setDataItem={setDataItem}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione uma mídia para editar na aba ao lado ou clique em "Novo
							Item" para adicionar uma nova mídia
						</h1>
					</div>
				)}
			</div>
		</>
	);
};

export default Midias;

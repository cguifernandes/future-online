import { useEffect, useState } from "react";
import Form from "../forms/form-funis";
import Button from "../components/button";
import clsx from "clsx";
import type { Funil } from "../../type/type";
import Modal from "./modal-funil";
import { addItem, getItem } from "../../utils/utils";
import { Plus } from "lucide-react";

const Funis = () => {
	const [visibleModal, setVisibleModal] = useState(false);
	const [isLoadingAdd, setIsLoadingAdd] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [contentItem, setContentItem] = useState<Funil>(undefined);
	const [data, setData] = useState<{
		itens: Funil[];
	}>({ itens: [] });

	useEffect(() => {
		setIsLoading(true);

		getItem<Funil>("funis")
			.then((data) => {
				setData({ itens: data });
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const handlerClickAdd = async () => {
		setIsLoadingAdd(true);
		setData({
			itens: await addItem<Funil>(
				{
					title: "Novo funil",
					item: null,
					type: "funis",
				},
				data,
			),
		});
		setIsLoadingAdd(false);
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-gray-800 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-yellow-500 rounded-tl-lg">
					Gerenciamento de Mídias
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
									type="button"
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
								isLoading={isLoadingAdd}
								className="hover:bg-yellow-700 min-w-36 flex items-center justify-center"
								onClick={handlerClickAdd}
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
								theme="yellow-dark"
								isLoading={isLoadingAdd}
								onClick={handlerClickAdd}
								className="min-w-36 flex items-center justify-center"
								icon={<Plus size={18} color="#fff" />}
							>
								Novo item
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="relative w-full h-full bg-gray-800 backdrop-blur rounded-r-lg border-l-2 border-white">
				{contentItem ? (
					<Form
						contentItem={contentItem}
						setContentItem={setContentItem}
						setData={setData}
						setVisibleModal={setVisibleModal}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione um funil para editar na aba ao lado ou clique em "Novo
							Item" para adicionar um novo funil
						</h1>
					</div>
				)}
			</div>
			{visibleModal && (
				<>
					<div
						className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-50"
						onClick={() => setVisibleModal(false)}
					/>
					<Modal
						setContentItem={setContentItem}
						setData={setData}
						content={contentItem}
						setVisibleModal={setVisibleModal}
					/>
				</>
			)}
		</>
	);
};

export default Funis;

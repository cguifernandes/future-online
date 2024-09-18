import { useEffect, useState } from "react";
import Button from "../components/button";
import { Plus } from "lucide-react";
import { Trigger as TriggerType } from "../../type/type";
import { addItem, getItem } from "../../utils/utils";
import clsx from "clsx";
import Form from "../forms/form-trigger";

const Trigger = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingAdd, setIsLoadingAdd] = useState(false);
	const [contentItem, setContentItem] = useState<TriggerType>(undefined);
	const [data, setData] = useState<{
		itens: TriggerType[];
	}>({ itens: [] });

	useEffect(() => {
		setIsLoading(true);

		getItem<TriggerType>("triggers")
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
			itens: await addItem<TriggerType>(
				{
					title: "Novo disparo em massa",
					type: "triggers",
					trigger: {
						type: "saveContacts",
						delay: {
							value1: 7,
							value2: 5,
						},
					},
				},
				data,
			),
		});
		setIsLoadingAdd(false);
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-gray-800 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-pink-500 rounded-tl-lg">
					Gerenciamento de Disparos em massa
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
									key={index}
									onClick={() => {
										setContentItem(item);
									}}
									theme="pink-dark"
									className={clsx(
										"text-left !rounded-none hover:bg-pink-700 min-h-[48px]",
										contentItem && item.id === contentItem?.id && "bg-pink-700",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="pink-dark"
								isLoading={isLoadingAdd}
								onClick={handlerClickAdd}
								className="hover:bg-pink-700 min-w-36 flex items-center justify-center"
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
								theme="pink-dark"
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
			<div className="bg-gray-800 rounded-r-lg border-l-2 border-white w-full h-full">
				{contentItem ? (
					<Form
						contentItem={contentItem}
						setContentItem={setContentItem}
						setData={setData}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione uma mensagem para editar na aba ao lado ou clique em
							"Novo Item" para adicionar uma nova mensagem
						</h1>
					</div>
				)}
			</div>
		</>
	);
};

export default Trigger;

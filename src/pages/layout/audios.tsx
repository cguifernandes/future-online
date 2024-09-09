import { useEffect, useState } from "react";
import Button from "../components/button";
import { addItem, getItem } from "../../utils/utils";
import { Audio } from "../../type/type";
import clsx from "clsx";
import { Plus } from "lucide-react";
import Form from "../forms/form-audios";

const Audios = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [contentItem, setContentItem] = useState<Audio>(undefined);
	const [data, setData] = useState<{
		itens: Audio[];
	}>({ itens: [] });

	useEffect(() => {
		setIsLoading(true);

		getItem<Audio>("audios")
			.then((data) => {
				setData({ itens: data });
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const handlerClickAdd = async () => {
		setData({
			itens: await addItem<Audio>(
				{
					title: "Novo conteúdo",
					audio: {
						url: "",
						preview: "",
					},
					type: "audios",
				},
				data,
			),
		});
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-gray-800 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-blue-500 rounded-tl-lg">
					Gerenciamento de Áudios
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
									theme="blue-dark"
									onClick={() => {
										setContentItem(item);
									}}
									className={clsx(
										"text-left !rounded-none hover:bg-blue-700 min-h-[48px]",
										contentItem && item.id === contentItem.id && "bg-blue-700",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="blue-dark"
								className="hover:bg-blue-700 min-w-36 flex items-center justify-center"
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
								theme="blue-dark"
								className="min-w-36 flex items-center justify-center"
								onClick={handlerClickAdd}
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
						setData={setData}
						setContentItem={setContentItem}
					/>
				) : (
					<div className="flex items-center justify-center px-4 h-full">
						<h1 className="text-lg text-white text-center">
							Selecione um áudio para editar na aba ao lado ou clique em "Novo
							Item" para adicionar um nova áudio
						</h1>
					</div>
				)}
			</div>
		</>
	);
};

export default Audios;

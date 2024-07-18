import { useEffect, useState } from "react";
import Button from "../components/button";
import clsx from "clsx";
import Form from "../forms/form-messages";
import type { Mensagem } from "../../type/type";
import {
	addItem,
	getItem,
	getUserIdWithToken,
	postItemDatabase,
} from "../../utils/utils";
import { Plus } from "lucide-react";
import Spinner from "../components/spinner";
import toast from "react-hot-toast";

const Messages = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingCreate, setIsLoadingCreate] = useState(false);
	const [contentItem, setContentItem] = useState<Mensagem>(undefined);
	const [data, setData] = useState<{
		itens: Mensagem[];
	}>({ itens: [] });

	useEffect(() => {
		setIsLoading(true);

		getItem<Mensagem>("mensagens")
			.then((data) => {
				setData({ itens: data });
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const handlerClickAdd = async () => {
		setIsLoadingCreate(true);
		const clientId = await getUserIdWithToken();

		postItemDatabase(
			"mensagem",
			clientId.id,
			JSON.stringify({
				content: "Novo item",
				title: "Novo conteúdo",
			}),
		)
			.then((response) => {
				setData({
					itens: addItem<Mensagem>(
						{
							content: "Novo item",
							title: "Novo conteúdo",
							type: "mensagens",
							id: "",
						},
						data,
						response.data.id,
					),
				});
			})
			.catch((e) => {
				console.log(e);
				toast.error("Falha ao salvar alterações", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#E53E3E]",
					duration: 5000,
				});
			})
			.finally(() => {
				setIsLoadingCreate(false);
			});
	};

	return (
		<>
			<div className="flex flex-col max-w-sm w-full h-full bg-black/70 rounded-l-lg">
				<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-purple-500 rounded-tl-lg">
					Gerenciamento de Mensagens
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
									theme="purple-dark"
									className={clsx(
										"text-left !rounded-none hover:bg-purple-800 min-h-[48px]",
										contentItem &&
											item.id === contentItem?.id &&
											"bg-purple-800",
									)}
								>
									{item.title}
								</Button>
							))}
						</div>
						<div className="flex flex-col justify-center items-center flex-1">
							<Button
								type="button"
								theme="purple-dark"
								className="hover:bg-purple-800 min-w-36 flex items-center justify-center"
								onClick={handlerClickAdd}
								icon={
									isLoadingCreate ? undefined : <Plus size={18} color="#fff" />
								}
							>
								{isLoadingCreate ? (
									<Spinner className="fill-purple-800" />
								) : (
									"Novo item"
								)}
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
								theme="purple-dark"
								className="min-w-36 flex items-center justify-center"
								onClick={handlerClickAdd}
								icon={
									isLoadingCreate ? undefined : <Plus size={18} color="#fff" />
								}
							>
								{isLoadingCreate ? (
									<Spinner className="fill-purple-800" />
								) : (
									"Novo item"
								)}
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

export default Messages;

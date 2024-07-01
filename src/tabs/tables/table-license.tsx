import Button from "../components/button";
import { Pencil, Plus, Trash } from "lucide-react";
import Input from "../components/input";
import { Dispatch, useEffect, useState } from "react";
import { Client } from "../../type/type";
import { formatDate, url } from "../../utils/utils";
import toast from "react-hot-toast";
import Pagination from "../components/pagination";

interface Props {
	setVisibleForm: Dispatch<React.SetStateAction<boolean>>;
}

const Table = ({ setVisibleForm }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [clients, setClients] = useState<Client[]>([]);
	const [count, setCount] = useState(0);
	const [refresh, setRefresh] = useState(false);
	const [page, setPage] = useState(1);
	const [notFound, setNotFound] = useState(false);
	const LIMIT_PER_PAGE = 12;
	const totalPages = Math.ceil(count / LIMIT_PER_PAGE);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsLoading(true);
		fetch(`${url}/api/client?limit=${LIMIT_PER_PAGE}&page=${page}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async (response) => {
				const data = await response.json();

				if (response.status >= 400 && response.status < 600) {
					toast.error("Ocorreu um erro ao buscar os clientes", {
						position: "bottom-right",
						className: "text-base ring-2 ring-[#1F2937]",
						duration: 5000,
					});
					return;
				}

				if (data.data.length === 0) {
					setNotFound(false);
					setPage(0);
				}

				setCount(data.count);
				setClients(data.data);
			})
			.catch((err) => {
				console.log(err);
				toast.error("Ocorreu um erro ao carregar os itens", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [refresh, page]);

	const handlerSearchClient = async (query: string) => {
		setIsLoading(true);
		setPage(1);

		if (query.trim() === "") {
			setRefresh((prev) => !prev);
		} else {
			try {
				const response = await fetch(
					`${url}/api/search/client?query=${query}&limit=${LIMIT_PER_PAGE}&page=${page}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					},
				);

				const data = await response.json();

				setPage(1);
				setClients(data.data);
				setCount(data.count ?? 0);
			} catch (err) {
				console.log(err);
				toast.error("Ocorreu um erro ao carregar os itens", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				setIsLoading(false);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handlerRemoveClient = async (id: string) => {
		try {
			const response = await fetch(`${url}/api/client/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (response.status >= 400 && response.status < 600) {
				toast.error("Ocorreu um erro ao remover um cliente", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			toast.success(data.message, {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});

			setPage(1);
			setRefresh((prev) => !prev);
		} catch (err) {
			console.log(err);
			toast.error("Ocorreu um erro ao carregar os itens", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});
			setIsLoading(false);
		}
	};

	return (
		<table className="w-full bg-gray-800 rounded-lg">
			<thead className="w-full rounded-t-lg">
				<tr>
					<th colSpan={5} className="p-3">
						<div className="flex items-center justify-between w-full">
							<Input
								className="font-medium w-96"
								placeholder="Buscar usuários"
								onChange={(e) => handlerSearchClient(e.target.value)}
							/>
							<Button
								type="button"
								theme="solid"
								onClick={() => setVisibleForm(true)}
								className="flex items-center gap-x-2"
							>
								Criar novo acesso <Plus size={24} />
							</Button>
						</div>
					</th>
				</tr>
				<tr className="border-y border-y-gray-100/50">
					<th className="text-left text-lg text-white p-3 max-w-36">Nome</th>
					<th className="text-left text-lg text-white p-3 max-w-36">E-mail</th>
					<th className="text-left text-lg text-white p-3 max-w-36">
						Telefone
					</th>
					<th className="text-left text-lg text-white p-3 max-w-36">
						Data final da licença
					</th>
					<th className="text-left text-lg text-white p-3">Ações</th>
				</tr>
			</thead>
			<tbody>
				{isLoading ? (
					<>
						{Array.from({ length: 4 }).map((_, index) => (
							<tr
								key={index}
								className="border-b border-gray-100/50 last:border-none"
							>
								<td className="text-white text-sm p-3 max-w-36">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3 max-w-36">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3 max-w-36">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3 max-w-36">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td>
									<div className="flex items-center p-3 gap-x-3">
										<button type="button">
											<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
										</button>
										<button type="button">
											<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</>
				) : clients.length === 0 ? (
					<tr>
						<td colSpan={5}>
							<div className="w-full p-3">
								<span className="text-white text-lg font-semibold">
									Cliente não encontrado
								</span>
							</div>
						</td>
					</tr>
				) : (
					clients.map((client) => (
						<tr
							key={client.id}
							className="border-b border-gray-100/50 last:border-none"
						>
							<td className="text-white text-sm p-3 truncate max-w-36">
								{client.name ?? "Usuário sem nome cadastrado"}
							</td>
							<td className="text-white text-sm p-3 truncate max-w-36">
								{client.email}
							</td>
							<td className="text-white text-sm p-3 truncate max-w-36">
								{client.phone}
							</td>
							<td className="text-white text-sm p-3 max-w-36">
								<time className="truncate">{formatDate(client.date)}</time>
							</td>
							<td>
								<div className="flex items-center p-3 gap-x-1">
									<button className="text-white text-sm" type="button">
										Editar
									</button>
									<span className="text-white">/</span>
									<button
										onClick={() => handlerRemoveClient(client.id)}
										type="button"
										className="text-white text-sm"
									>
										Excluir
									</button>
								</div>
							</td>
						</tr>
					))
				)}
			</tbody>
			<tfoot>
				<tr className="border-t border-gray-100/50 ">
					<td colSpan={5}>
						<div className="w-full flex items-center p-3">
							<Pagination
								notFoundPages={notFound}
								totalPages={totalPages}
								page={page}
								setPage={setPage}
							/>
						</div>
					</td>
				</tr>
			</tfoot>
		</table>
	);
};

export default Table;

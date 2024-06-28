import Button from "../components/button";
import { Pencil, Plus, Trash } from "lucide-react";
import Input from "../components/input";
import { Dispatch, useEffect, useState } from "react";
import { Client } from "../../type/type";
import { url } from "../../utils/utils";
import toast from "react-hot-toast";

interface Props {
	setVisibleForm: Dispatch<React.SetStateAction<boolean>>;
}

const Table = ({ setVisibleForm }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [clients, setClients] = useState<Client[]>([]);

	useEffect(() => {
		setIsLoading(true);
		fetch(`${url}/api/client`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async (response) => {
				const data = await response.json();

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
	}, []);

	return (
		<table className="w-full bg-gray-800 rounded-lg">
			<thead className="w-full rounded-t-lg">
				<tr>
					<th colSpan={5} className="p-3">
						<div className="flex items-center justify-between w-full">
							<Input
								className="font-medium w-96"
								placeholder="Buscar usuários"
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
					<th className="text-left text-lg text-white p-3">Nome</th>
					<th className="text-left text-lg text-white p-3">E-mail</th>
					<th className="text-left text-lg text-white p-3">Telefone</th>
					<th className="text-left text-lg text-white p-3">
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
								<td className="text-white text-sm p-3">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3">
									<div className="h-[18px] bg-gray-200 rounded-full dark:bg-gray-700 w-48" />
								</td>
								<td className="text-white text-sm p-3">
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
				) : (
					clients.map((client) => (
						<tr
							key={client.id}
							className="border-b border-gray-100/50 last:border-none"
						>
							<td className="text-white text-sm p-3">
								{client.name ?? "Usuário sem nome cadastrado"}
							</td>
							<td className="text-white text-sm p-3">{client.email}</td>
							<td className="text-white text-sm p-3">{client.phone}</td>
							<td className="text-white text-sm p-3">
								{client.date.toLocaleString()}
							</td>
							<td>
								<div className="flex items-center p-3 gap-x-3">
									<button type="button">
										<Pencil color="#fff" size={18} />
									</button>
									<button type="button">
										<Trash color="#fff" size={18} />
									</button>
								</div>
							</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);
};

export default Table;

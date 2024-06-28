import Button from "../components/button";
import { Pencil, Plus, Trash } from "lucide-react";
import Input from "../components/input";
import { Dispatch } from "react";

interface Props {
	setVisibleForm: Dispatch<React.SetStateAction<boolean>>;
}

const Table = ({ setVisibleForm }: Props) => {
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
				<tr className="border-b border-gray-100/50 last:border-none">
					<td className="text-white text-sm p-3">Guilherme Fernandes</td>
					<td className="text-white text-sm p-3">gui.adfer@gmail.com</td>
					<td className="text-white text-sm p-3">(11) 932368610</td>
					<td className="text-white text-sm p-3">gui.adfer@gmail.com</td>
					<td>
						<div className="flex items-center p-3 gap-x-3">
							<button type="button">
								<Pencil color="#fff" size={24} />
							</button>
							<button type="button">
								<Trash color="#fff" size={24} />
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default Table;

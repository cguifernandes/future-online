import { useState } from "react";
import Form from "../forms/form-new-license";
import Table from "../tables/table-license";

const PanelControl = () => {
	const [visibleForm, setVisibleForm] = useState(false);

	return (
		<main className="w-full min-h-[calc(100vh_-_96px)] max-w-7xl mx-auto py-6 px-8">
			{visibleForm ? (
				<>
					<div className="flex flex-col gap-y-px pb-6">
						<h1 className="text-lg font-bold">
							Formulário de criação de licença
						</h1>
						<span className="text-base">Campos com "*" são obrigatórios</span>
					</div>
					<Form />
				</>
			) : (
				<>
					<div className="flex flex-col gap-y-px pb-6">
						<h1 className="text-2xl font-bold">Controle de acesso</h1>
						<span className="text-base">
							Controle o acesso de usuários ao sistema
						</span>
					</div>
					<Table setVisibleForm={setVisibleForm} />
				</>
			)}
		</main>
	);
};

export default PanelControl;

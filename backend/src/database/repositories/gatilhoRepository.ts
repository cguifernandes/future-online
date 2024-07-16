import Client from "../entities/Client";
import { AppDataSource } from "../data-source";
import Gatilho from "../entities/Gatilho";

const clientRepository = AppDataSource.getRepository(Client);
const gatilhoRepository = AppDataSource.getRepository(Gatilho);

export const setGatilho = async (newGatilho: Gatilho, clientId: string) => {
	try {
		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const createGatilho = gatilhoRepository.create({
			...newGatilho,
			client,
		});

		const gatilho = await gatilhoRepository.save(createGatilho);

		return {
			status: 200,
			data: gatilho,
			message: "Áudio criado com sucesso",
		};
	} catch (error) {
		console.error("Erro ao criar áudio:", error);
		return {
			status: 500,
			message: "Erro ao criar áudio",
		};
	}
};

export const removeGatilho = async (id: string, clientId: string) => {
	try {
		if (!id || !clientId) {
			return {
				status: 400,
				message: "Parâmetros inválidos",
				data: undefined,
			};
		}

		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const gatilhoToRemove = await gatilhoRepository.findOne({
			where: {
				id: id,
				client: { id: clientId },
			},
		});

		if (!gatilhoToRemove) {
			return {
				status: 404,
				data: undefined,
				message: "Gatilho não encontrado para este cliente",
			};
		}

		await gatilhoRepository.remove(gatilhoToRemove);

		return {
			status: 200,
			data: undefined,
			message: "Gatilho removido com sucesso",
		};
	} catch (error) {
		console.error("Erro ao remover gatilho:", error);
		return {
			status: 500,
			message: "Erro ao remover gatilho",
		};
	}
};

export const updateGatilho = async (
	id: string,
	clientId: string,
	newGatilho: Gatilho,
) => {
	try {
		if (!id || !clientId || !newGatilho) {
			return {
				status: 400,
				message: "Parâmetros inválidos",
				data: undefined,
			};
		}

		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		await gatilhoRepository.update(id, { ...newGatilho });

		return {
			status: 200,
			data: undefined,
			message: "Gatilho alterada",
		};
	} catch (error) {
		console.error("Erro ao alterar gatilho:", error);
		return {
			status: 500,
			message: "Erro ao alterar gatilho",
		};
	}
};

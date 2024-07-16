import Client from "../entities/Client";
import { AppDataSource } from "../data-source";
import Funil from "../entities/Funil";

const clientRepository = AppDataSource.getRepository(Client);
const funilRepository = AppDataSource.getRepository(Funil);

export const setFunil = async (newFunil: Funil, clientId: string) => {
	try {
		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const createFunil = funilRepository.create({
			...newFunil,
			client,
		});

		const funil = await funilRepository.save(createFunil);

		return {
			status: 200,
			data: funil,
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

export const removeFunil = async (id: string, clientId: string) => {
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

		const funilToRemove = await funilRepository.findOne({
			where: {
				id: id,
				client: { id: clientId },
			},
		});

		if (!funilToRemove) {
			return {
				status: 404,
				data: undefined,
				message: "Funil não encontrado para este cliente",
			};
		}

		await funilRepository.remove(funilToRemove);

		return {
			status: 200,
			data: undefined,
			message: "Funil removido com sucesso",
		};
	} catch (error) {
		console.error("Erro ao remover funil:", error);
		return {
			status: 500,
			message: "Erro ao remover funil",
		};
	}
};

export const updateFunil = async (
	id: string,
	clientId: string,
	newFunil: Funil,
) => {
	try {
		if (!id || !clientId || !newFunil) {
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

		await funilRepository.update(id, { ...newFunil });

		return {
			status: 200,
			data: undefined,
			message: "Funil alterada",
		};
	} catch (error) {
		console.error("Erro ao alterar funil:", error);
		return {
			status: 500,
			message: "Erro ao alterar funil",
		};
	}
};

import Client from "../entities/Client";
import { AppDataSource } from "../data-source";
import Midia from "../entities/Midia";

const clientRepository = AppDataSource.getRepository(Client);
const midiaRepository = AppDataSource.getRepository(Midia);

export const setMidia = async (newMidia: Midia, clientId: string) => {
	try {
		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const createMidia = midiaRepository.create({
			...newMidia,
			client,
		});

		const midia = await midiaRepository.save(createMidia);

		return {
			status: 200,
			data: midia,
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

export const removeMidia = async (id: string, clientId: string) => {
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

		const midiaToRemove = await midiaRepository.findOne({
			where: {
				id: id,
				client: { id: clientId },
			},
		});

		if (!midiaToRemove) {
			return {
				status: 404,
				data: undefined,
				message: "Mídia não encontrada para este cliente",
			};
		}

		await midiaRepository.remove(midiaToRemove);

		return {
			status: 200,
			data: undefined,
			message: "Mídia removida com sucesso",
		};
	} catch (error) {
		console.error("Erro ao remover mídia:", error);
		return {
			status: 500,
			message: "Erro ao remover mídia",
		};
	}
};

export const updateMidia = async (
	id: string,
	clientId: string,
	newMidia: Midia,
) => {
	try {
		if (!id || !clientId || !newMidia) {
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

		await midiaRepository.update(id, { ...newMidia });

		return {
			status: 200,
			data: undefined,
			message: "Midia alterada",
		};
	} catch (error) {
		console.error("Erro ao remover midia:", error);
		return {
			status: 500,
			message: "Erro ao remover midia",
		};
	}
};

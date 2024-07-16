import Client from "../entities/Client";
import { AppDataSource } from "../data-source";
import Mensagem from "../entities/Mensagem";

const clientRepository = AppDataSource.getRepository(Client);
const mensagemRepository = AppDataSource.getRepository(Mensagem);

export const setMensagem = async (newMensagem: Mensagem, clientId: string) => {
	try {
		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const createMensagem = mensagemRepository.create({
			...newMensagem,
			client,
		});

		const mensagem = await mensagemRepository.save(createMensagem);

		return {
			status: 200,
			data: mensagem,
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

export const removeMensagem = async (id: string, clientId: string) => {
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

		const mensagemToRemove = await mensagemRepository.findOne({
			where: {
				id: id,
				client: { id: clientId },
			},
		});

		if (!mensagemToRemove) {
			return {
				status: 404,
				data: undefined,
				message: "Mensagem não encontrada para este cliente",
			};
		}

		await mensagemRepository.remove(mensagemToRemove);

		return {
			status: 200,
			data: undefined,
			message: "Mensagem removida com sucesso",
		};
	} catch (error) {
		console.error("Erro ao remover mensagem:", error);
		return {
			status: 500,
			message: "Erro ao remover mensagem",
		};
	}
};

export const updateMensagem = async (
	id: string,
	clientId: string,
	newMensagem: Mensagem,
) => {
	try {
		if (!id || !clientId || !newMensagem) {
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

		await mensagemRepository.update(id, {
			content: newMensagem.content,
			title: newMensagem.title,
		});

		return {
			status: 200,
			data: undefined,
			message: "Mensagem alterada",
		};
	} catch (error) {
		console.error("Erro ao remover mensagem:", error);
		return {
			status: 500,
			message: "Erro ao remover mensagem",
		};
	}
};

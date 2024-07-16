import Audio from "../entities/Audio";
import Client from "../entities/Client";
import { AppDataSource } from "../data-source";

const clientRepository = AppDataSource.getRepository(Client);
const audioRepository = AppDataSource.getRepository(Audio);

export const setAudio = async (newAudio: Audio, clientId: string) => {
	try {
		const client = await clientRepository.findOneBy({ id: clientId });

		if (!client) {
			return {
				status: 404,
				data: undefined,
				message: "Cliente não encontrado",
			};
		}

		const createAudio = audioRepository.create({
			...newAudio,
			client,
		});

		const audio = await audioRepository.save(createAudio);

		return {
			status: 200,
			data: audio,
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

export const removeAudio = async (id: string, clientId: string) => {
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

		const audioToRemove = await audioRepository.findOne({
			where: {
				id: id,
				client: { id: clientId },
			},
		});

		if (!audioToRemove) {
			return {
				status: 404,
				data: undefined,
				message: "Áudio não encontrado para este cliente",
			};
		}

		await audioRepository.remove(audioToRemove);

		return {
			status: 200,
			data: undefined,
			message: "Áudio removido com sucesso",
		};
	} catch (error) {
		console.error("Erro ao remover áudio:", error);
		return {
			status: 500,
			message: "Erro ao remover áudio",
		};
	}
};

export const updateAudio = async (
	id: string,
	clientId: string,
	newAudio: Audio,
) => {
	try {
		if (!id || !clientId || !newAudio) {
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

		await audioRepository.update(id, { ...newAudio });

		return {
			status: 404,
			data: undefined,
			message: "Audio alterada",
		};
	} catch (error) {
		console.error("Erro ao remover audio:", error);
		return {
			status: 500,
			message: "Erro ao remover audio",
		};
	}
};

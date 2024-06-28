import { AppDataSource } from "../data-source";
import Client from "../entites/Client";

const clientRepository = AppDataSource.getRepository(Client);

export const getClients = async () => {
	try {
		const clients = await clientRepository.find();

		return {
			status: 201,
			message: "Cliente cadastrado com sucesso",
			data: clients,
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao cadastrar cliente",
		};
	}
};

export const setClient = async (newClient: Client) => {
	try {
		if (!newClient.email || !newClient.phone || !newClient.date) {
			return {
				status: 204,
				data: undefined,
				message: "Usuário inválido",
			};
		}

		const client = clientRepository.create({
			...newClient,
		});

		await clientRepository.save(client);

		return {
			status: 201,
			message: "Cliente cadastrado com sucesso",
			data: client,
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao cadastrar cliente",
		};
	}
};

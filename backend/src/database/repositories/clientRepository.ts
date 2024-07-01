import { ILike } from "typeorm";
import { AppDataSource } from "../data-source";
import Client from "../entites/Client";

const clientRepository = AppDataSource.getRepository(Client);

export const getClients = async (limit: string, page: string) => {
	try {
		if (!limit || !page) {
			return {
				status: 204,
				data: undefined,
				message: "Valores não foram fornecidos",
			};
		}

		const parsedLimit = Number.parseInt(limit);
		const parsedPage = Number.parseInt(page);
		const currentPage = Math.max(Number(parsedPage || 1), 1);

		const clients = await clientRepository.find({
			take: parsedLimit,
			order: {
				date: "ASC",
			},
			skip: (currentPage - 1) * parsedLimit,
		});

		const count = await clientRepository.count({
			take: parsedLimit,
			skip: (currentPage - 1) * parsedLimit,
		});

		return {
			status: 201,
			message: "Cliente cadastrado com sucesso",
			data: clients,
			count,
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao cadastrar cliente",
		};
	}
};

export const searchClient = async (
	query: string,
	limit: string,
	page: string,
) => {
	try {
		if (!query) {
			return {
				status: 204,
				data: undefined,
				message: "Valor de pesquisa não foram fornecidos",
			};
		}

		const parsedLimit = Number.parseInt(limit);
		const parsedPage = Number.parseInt(page);
		const currentPage = Math.max(Number(parsedPage || 1), 1);

		const clients = await clientRepository.find({
			take: parsedLimit,
			order: {
				date: "ASC",
			},
			skip: (currentPage - 1) * parsedLimit,
			where: [{ name: ILike(`%${query}%`) }, { phone: ILike(`%${query}%`) }],
		});

		const count = await clientRepository.count({
			take: parsedLimit,
			skip: (currentPage - 1) * parsedLimit,
			where: [{ name: ILike(`%${query}%`) }, { phone: ILike(`%${query}%`) }],
		});

		if (!clients || clients.length === 0) {
			return {
				status: 404,
				data: [],
				message: "Cliente não encontrado",
				count: 0,
			};
		}

		return {
			status: 201,
			message: "Clientes encontrado",
			data: clients,
			count,
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao procurar clientes",
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

export const removeClient = async (id: string) => {
	try {
		if (!id) {
			return {
				status: 204,
				data: undefined,
				message: "Usuário inválido",
			};
		}

		const findClient = await clientRepository.find({
			where: {
				id,
			},
		});

		const client = clientRepository.remove(findClient);

		return {
			status: 201,
			message: "Cliente removido com sucesso",
			data: client,
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao remover cliente",
		};
	}
};

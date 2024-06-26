import { ILike } from "typeorm";
import { AppDataSource } from "../data-source";
import Client from "../entites/Client";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

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

		const existClient = await clientRepository.findOne({
			where: {
				email: newClient.email,
			},
		});

		if (existClient) {
			return {
				status: 409,
				data: undefined,
				message: "Já existe um cliente com este email",
			};
		}

		const password = `${newClient.email.substring(
			0,
			3,
		)}${newClient.phone.substring(newClient.phone.length - 3)}`;
		const hash = await bcrypt.hash(password, 10);

		const client = clientRepository.create({
			...newClient,
			password: hash,
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

export const authenticateClient = async (email: string, password: string) => {
	try {
		if (!email || !password) {
			return {
				status: 204,
				data: undefined,
				message: "Usuário inválido",
			};
		}

		let token = "";

		if (
			email === process.env.ADMIN_EMAIL &&
			password === process.env.ADMIN_PASSWORD
		) {
			token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET ?? "", {
				expiresIn: "7d",
			});

			return {
				status: 200,
				message: "Cliente autenticado com sucesso",
				data: undefined,
				token,
			};
		} else {
			const client = await clientRepository.findOneBy({
				email,
			});

			if (!client) {
				return {
					status: 404,
					data: undefined,
					message: "E-mail ou senha incorreto, por favor tente novamente",
				};
			}

			const isValid = await bcrypt.compare(password, client.password);

			if (!isValid) {
				return {
					status: 401,
					data: undefined,
					message: "Senha inválida",
				};
			}

			token = jwt.sign({ role: "user" }, process.env.JWT_SECRET ?? "", {
				expiresIn: "7d",
			});

			return {
				status: 200,
				message: "Cliente autenticado com sucesso",
				data: client,
				token,
			};
		}
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Erro ao autenticar cliente",
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

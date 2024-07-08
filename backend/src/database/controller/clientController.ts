import { Request, Response } from "express";
import {
	authenticateClient,
	changePassword,
	getClients,
	removeClient,
	searchClient,
	setClient,
} from "../repositories/clientRepository";
require("dotenv").config();

export const getClientsController = async (req: Request, res: Response) => {
	const { page, limit }: { page: string; limit: string } = req.query as {
		page: string;
		limit: string;
	};
	const client = await getClients(limit, page);

	res.status(client.status).json(client);
};

export const authenticateController = async (req: Request, res: Response) => {
	const { identifier, password }: { identifier: string; password: string } =
		req.query as {
			identifier: string;
			password: string;
		};

	const client = await authenticateClient(identifier, password);

	res.status(client.status).json(client);
};

export const searchClientsController = async (req: Request, res: Response) => {
	const { query, limit, page }: { query: string; page: string; limit: string } =
		req.query as {
			query: string;
			page: string;
			limit: string;
		};

	const client = await searchClient(query, limit, page);

	res.status(client.status).json(client);
};

export const setClientsController = async (req: Request, res: Response) => {
	const newClient = req.body;
	const instanceNewClient = await setClient(newClient);

	res.status(instanceNewClient.status).json(instanceNewClient);
};

export const removeClientsController = async (req: Request, res: Response) => {
	const { id } = req.params;
	const instanceRemoveClient = await removeClient(id);

	res.status(instanceRemoveClient.status).json(instanceRemoveClient);
};

export const changePasswordController = async (req: Request, res: Response) => {
	const { password, newPassword } = req.body;
	const { id }: { id: string } = req.query as {
		id: string;
	};

	const instanceChangePassword = await changePassword(
		password,
		id,
		newPassword,
	);

	res.status(instanceChangePassword.status).json(instanceChangePassword);
};

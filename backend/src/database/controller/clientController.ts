import { Request, Response } from "express";
import {
	getClients,
	removeClient,
	searchClient,
	setClient,
} from "../repositories/clientRepository";

export const getClientsController = async (req: Request, res: Response) => {
	const { page, limit }: { page: string; limit: string } = req.query as {
		page: string;
		limit: string;
	};
	const client = await getClients(limit, page);

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

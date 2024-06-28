import { Request, Response } from "express";
import { getClients, setClient } from "../repositories/clientRepository";

export const getClientsController = async (req: Request, res: Response) => {
	const clients = await getClients();

	res.status(clients.status).json(clients);
};

export const setClientsController = async (req: Request, res: Response) => {
	const newClient = req.body;

	res
		.status((await setClient(newClient)).status)
		.json(await setClient(newClient));
};

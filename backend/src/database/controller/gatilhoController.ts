import { Request, Response } from "express";
import {
	removeGatilho,
	setGatilho,
	updateGatilho,
} from "../repositories/gatilhoRepository";

export const setGatilhoController = async (req: Request, res: Response) => {
	const newGatilho = req.body;
	const { clientId }: { clientId: string } = req.query as {
		clientId: string;
	};
	const client = await setGatilho(newGatilho, clientId);

	res.status(client.status).json(client);
};

export const removeGatilhoController = async (req: Request, res: Response) => {
	const { id, clientId }: { id: string; clientId: string } = req.query as {
		id: string;
		clientId: string;
	};

	const removalResult = await removeGatilho(id, clientId);

	res.status(removalResult.status).json(removalResult);
};

export const updateGatilhoController = async (req: Request, res: Response) => {
	const { id, clientId, newGatilho } = req.body;

	const result = await updateGatilho(id, clientId, newGatilho);

	res.status(result.status).json(result);
};

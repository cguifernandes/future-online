import { Request, Response } from "express";
import {
	removeFunil,
	setFunil,
	updateFunil,
} from "../repositories/funilRepository";

export const setFunilController = async (req: Request, res: Response) => {
	const newFunil = req.body;
	const { clientId }: { clientId: string } = req.query as {
		clientId: string;
	};

	const client = await setFunil(newFunil, clientId);

	res.status(client.status).json(client);
};

export const removeFunilController = async (req: Request, res: Response) => {
	const { id, clientId }: { id: string; clientId: string } = req.query as {
		id: string;
		clientId: string;
	};

	const removalResult = await removeFunil(id, clientId);

	res.status(removalResult.status).json(removalResult);
};

export const updateFunilController = async (req: Request, res: Response) => {
	const { id, clientId, newFunil } = req.body;

	const result = await updateFunil(id, clientId, newFunil);

	res.status(result.status).json(result);
};

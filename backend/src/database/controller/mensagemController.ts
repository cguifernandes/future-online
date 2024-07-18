import { Request, Response } from "express";
import {
	setMensagem,
	removeMensagem,
	updateMensagem,
} from "../repositories/mensagemRepository";

export const setMensagemController = async (req: Request, res: Response) => {
	const newMensagem = req.body;
	const { clientId }: { clientId: string } = req.query as { clientId: string };

	const client = await setMensagem(newMensagem, clientId);

	res.status(client.status).json(client);
};

export const removeMensagemController = async (req: Request, res: Response) => {
	const { id, clientId }: { id: string; clientId: string } = req.query as {
		id: string;
		clientId: string;
	};

	const removalResult = await removeMensagem(id, clientId);

	res.status(removalResult.status).json(removalResult);
};

export const updateMensagemController = async (req: Request, res: Response) => {
	const { id, clientId, newMensagem } = req.body;

	const result = await updateMensagem(id, clientId, newMensagem);

	res.status(result.status).json(result);
};

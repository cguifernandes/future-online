import { Request, Response } from "express";
import {
	removeAudio,
	setAudio,
	updateAudio,
} from "../repositories/audioRepository";

export const setAudioController = async (req: Request, res: Response) => {
	const newAudio = req.body;
	const { clientId }: { clientId: string } = req.query as {
		clientId: string;
	};
	const client = await setAudio(newAudio, clientId);

	res.status(client.status).json(client);
};

export const removeAudioController = async (req: Request, res: Response) => {
	const { id, clientId }: { id: string; clientId: string } = req.query as {
		id: string;
		clientId: string;
	};

	const removalResult = await removeAudio(id, clientId);

	res.status(removalResult.status).json(removalResult);
};

export const updateAudioController = async (req: Request, res: Response) => {
	const { id, clientId, newAudio } = req.body;

	const result = await updateAudio(id, clientId, newAudio);

	res.status(result.status).json(result);
};

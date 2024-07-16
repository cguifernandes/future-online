import { Request, Response } from "express";
import * as AWS from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
	setMidia,
	removeMidia as removeMidiaRepository,
	updateMidia,
} from "../repositories/midiaRepository";

const s3 = new AWS.S3({
	region: process.env.AWS_REGION ?? "",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
	},
});

export const uploadMidia = async (
	file: Express.Multer.File | undefined,
	req: Request,
	res: Response,
) => {
	try {
		const { folderName }: { folderName: string } = req.query as {
			folderName: string;
		};

		if (!file) {
			return res.status(400).json({ message: "Arquivo inválido" });
		}

		const fileName = `${folderName}${file.originalname}`;

		const upload = new Upload({
			client: s3,
			leavePartsOnError: false,
			params: {
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: fileName,
				Body: file.buffer,
				ContentDisposition: "inline",
				ContentType: file.mimetype,
			},
		});

		await upload.done();

		const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

		res.status(201).json({ message: "Imagem enviada com sucesso", data: url });
	} catch (err) {
		console.error("Erro ao fazer o upload da imagem:", err);
		res.status(500).json({ error: "Erro ao fazer o upload da imagem" });
	}
};

export const removeMidia = (req: Request, res: Response) => {
	try {
		const { fileName }: { fileName: string } = req.query as {
			fileName: string;
		};

		if (!fileName) {
			return res.status(400).json({ message: "Nome do arquivo inválido" });
		}

		s3.deleteObject({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: fileName,
		}).then(() =>
			res.status(200).json({ message: "Imagem removida com sucesso" }),
		);
	} catch (err) {
		console.error("Erro ao removar a imagem:", err);
		res.status(500).json({ error: "Erro ao remover a imagem" });
	}
};

export const setMidiaController = async (req: Request, res: Response) => {
	const newMidia = req.body;
	const { clientId }: { clientId: string } = req.query as {
		clientId: string;
	};
	const client = await setMidia(newMidia, clientId);

	res.status(client.status).json(client);
};

export const removeMidiaController = async (req: Request, res: Response) => {
	const { id, clientId }: { id: string; clientId: string } = req.query as {
		id: string;
		clientId: string;
	};

	const removalResult = await removeMidiaRepository(id, clientId);

	res.status(removalResult.status).json(removalResult);
};

export const updateMidiaController = async (req: Request, res: Response) => {
	const { id, clientId, newMidia } = req.body;

	const result = await updateMidia(id, clientId, newMidia);

	res.status(result.status).json(result);
};

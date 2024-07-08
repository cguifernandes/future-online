import { Request, Response } from "express";
import * as AWS from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3 = new AWS.S3({
	region: process.env.AWS_REGION ?? "",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
	},
});

export const UploadMidia = async (
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

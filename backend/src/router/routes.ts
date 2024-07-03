import { type Request, type Response, Router } from "express";
import {
	authenticateController,
	getClientsController,
	removeClientsController,
	searchClientsController,
	setClientsController,
} from "../database/controller/clientController";
import { verifyToken } from "../middleware";
import * as jwt from "jsonwebtoken";
import multer from "multer";
import * as AWS from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
const routers = Router();

const s3 = new AWS.S3({
	region: process.env.AWS_REGION ?? "",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
	},
});

const upload = multer({ storage: multer.memoryStorage() });

// routers.use((req, res, next) => {
// 	if (req.path === "/api/client/authenticate") {
// 		return next();
// 	}

// 	verifyToken(req, res, next);
// });

routers.post(
	"/api/upload",
	upload.single("file"),
	async (req: Request, res: Response) => {
		try {
			const { folderName }: { folderName: string } = req.query as {
				folderName: string;
			};

			const file = req.file;

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

			res
				.status(201)
				.json({ message: "Imagem enviada com sucesso", data: url });
		} catch (err) {
			console.error("Erro ao fazer o upload da imagem:", err);
			res.status(500).json({ error: "Erro ao fazer o upload da imagem" });
		}
	},
);

routers.get("/api/client", (req: Request, res: Response) =>
	getClientsController(req, res),
);

routers.get("/api/search/client", (req: Request, res: Response) =>
	searchClientsController(req, res),
);

routers.get("/api/client/authenticate", (req: Request, res: Response) =>
	authenticateController(req, res),
);

routers.get("/api/decoded-token", (req: Request, res: Response) => {
	const { token }: { token: string } = req.query as {
		token: string;
	};

	const decoded = jwt.decode(token);

	res.json(decoded);
});

routers.post("/api/client", (req: Request, res: Response) =>
	setClientsController(req, res),
);

routers.delete("/api/client/:id", (req: Request, res: Response) =>
	removeClientsController(req, res),
);

export default routers;

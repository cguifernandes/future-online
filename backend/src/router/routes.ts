import { type Request, type Response, Router } from "express";
import {
	authenticateController,
	changePasswordController,
	getClientsController,
	removeClientsController,
	searchClientsController,
	setClientsController,
} from "../database/controller/clientController";
import multer from "multer";
import { UploadMidia } from "../database/controller/midiaController";
import { DecodedToken } from "../database/controller/tokenController";
const routers = Router();

const upload = multer({ storage: multer.memoryStorage() });

// routers.use((req, res, next) => {
// 	if (req.path === "/api/client/authenticate") {
// 		return next();
// 	}

// 	verifyToken(req, res, next);
// });

//MIDIAS
routers.post(
	"/api/upload",
	upload.single("file"),
	async (req: Request, res: Response) => {
		await UploadMidia(req.file, req, res);
	},
);

//CLIENTS
routers.get("/api/client", (req: Request, res: Response) =>
	getClientsController(req, res),
);

routers.get("/api/search/client", (req: Request, res: Response) =>
	searchClientsController(req, res),
);

routers.get("/api/client/authenticate", (req: Request, res: Response) =>
	authenticateController(req, res),
);

routers.put("/api/client", (req: Request, res: Response) => {
	changePasswordController(req, res);
});

routers.post("/api/client", (req: Request, res: Response) =>
	setClientsController(req, res),
);

routers.delete("/api/client/:id", (req: Request, res: Response) =>
	removeClientsController(req, res),
);

//TOKEN
routers.get("/api/decoded-token", (req: Request, res: Response) =>
	DecodedToken(req, res),
);

export default routers;

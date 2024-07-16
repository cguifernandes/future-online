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
import {
	removeMidia,
	removeMidiaController,
	setMidiaController,
	updateMidiaController,
	uploadMidia,
} from "../database/controller/midiaController";
import { DecodedToken } from "../database/controller/tokenController";
import {
	setAudioController,
	removeAudioController,
	updateAudioController,
} from "../database/controller/audioController";
import {
	setFunilController,
	removeFunilController,
	updateFunilController,
} from "../database/controller/funilController";
import {
	setGatilhoController,
	removeGatilhoController,
	updateGatilhoController,
} from "../database/controller/gatilhoController";
import {
	setMensagemController,
	removeMensagemController,
	updateMensagemController,
} from "../database/controller/mensagemController";
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
	"/api/file",
	upload.single("file"),
	async (req: Request, res: Response) => {
		await uploadMidia(req.file, req, res);
	},
);

routers.delete("/api/file", (req: Request, res: Response) =>
	removeMidia(req, res),
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

routers.post("/api/client/audio", (req: Request, res: Response) => {
	setAudioController(req, res);
});

routers.post("/api/client/funil", (req: Request, res: Response) => {
	setFunilController(req, res);
});

routers.post("/api/client/gatilho", (req: Request, res: Response) => {
	setGatilhoController(req, res);
});

routers.post("/api/client/midia", (req: Request, res: Response) => {
	setMidiaController(req, res);
});

routers.post("/api/client/mensagem", (req: Request, res: Response) => {
	setMensagemController(req, res);
});

routers.put("/api/client/audio", (req: Request, res: Response) => {
	updateAudioController(req, res);
});

routers.put("/api/client/funil", (req: Request, res: Response) => {
	updateFunilController(req, res);
});

routers.put("/api/client/gatilho", (req: Request, res: Response) => {
	updateGatilhoController(req, res);
});

routers.put("/api/client/midia", (req: Request, res: Response) => {
	updateMidiaController(req, res);
});

routers.put("/api/client/mensagem", (req: Request, res: Response) => {
	updateMensagemController(req, res);
});

routers.delete("/api/client/audio", (req: Request, res: Response) => {
	removeAudioController(req, res);
});

routers.delete("/api/client/funil", (req: Request, res: Response) => {
	removeFunilController(req, res);
});

routers.delete("/api/client/gatilho", (req: Request, res: Response) => {
	removeGatilhoController(req, res);
});

routers.delete("/api/client/midia", (req: Request, res: Response) => {
	removeMidiaController(req, res);
});

routers.delete("/api/client/mensagem", (req: Request, res: Response) => {
	removeMensagemController(req, res);
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

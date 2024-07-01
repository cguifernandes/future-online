import { type Request, type Response, Router } from "express";
import {
	getClientsController,
	removeClientsController,
	searchClientsController,
	setClientsController,
} from "../database/controller/clientController";
const routers = Router();

routers.get("/api/client", (req: Request, res: Response) =>
	getClientsController(req, res),
);

routers.get("/api/search/client", (req: Request, res: Response) =>
	searchClientsController(req, res),
);

routers.post("/api/client", (req: Request, res: Response) =>
	setClientsController(req, res),
);

routers.delete("/api/client/:id", (req: Request, res: Response) =>
	removeClientsController(req, res),
);

export default routers;

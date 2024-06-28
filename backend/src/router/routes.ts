import { type Request, type Response, Router } from "express";
import {
	getClientsController,
	setClientsController,
} from "../database/controller/clientController";
const routers = Router();

routers.get("/api/client", (req: Request, res: Response) =>
	getClientsController(req, res),
);

routers.post("/api/client", (req: Request, res: Response) =>
	setClientsController(req, res),
);

export default routers;

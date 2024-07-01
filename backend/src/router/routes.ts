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

const routers = Router();

// routers.use((req, res, next) => {
// 	if (req.path === "/api/client/authenticate") {
// 		return next();
// 	}

// 	verifyToken(req, res, next);
// });

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

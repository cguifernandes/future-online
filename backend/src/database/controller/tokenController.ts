import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const DecodedToken = (req: Request, res: Response) => {
	const { token }: { token: string } = req.query as {
		token: string;
	};

	const decoded = jwt.decode(token);

	res.json(decoded);
};

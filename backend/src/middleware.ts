import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "";

interface CustomRequest extends Request {
	user?: any;
}

export const verifyToken = (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers["authorization" ?? ""];
	if (!authHeader)
		return res.status(403).json({ message: "Token não fornecido" });

	const token = authHeader.split(" ")[1];
	if (!token) return res.status(403).json({ message: "Token não fornecido" });

	jwt.verify(token, secretKey, (err, decoded) => {
		if (err) return res.status(401).json({ message: "Token inválido" });

		req.user = decoded;
		next();
	});
};

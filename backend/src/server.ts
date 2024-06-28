import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const port = 3333;
const prisma = new PrismaClient();
require("dotenv").config();

const corsOptions = {
	origin: "chrome-extension://dahnlbionbfhifkiknhfcefcmdpjille",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));

app.get("/client", async (req: Request, res: Response) => {
	try {
		const users = await prisma.client.findMany();
		res.status(200).json({ message: "Listagem de clientes", data: users });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Erro ao buscar dados" });
	}
});

app.post("/client", async (req: Request, res: Response) => {
	const { name, email, phone, date } = req.body;

	if (!name || !email || !phone || !date) {
		return res.status(204).json({ message: "Dados insuficientes" });
	}

	try {
		await prisma.client.create({
			data: {
				name,
				email,
				phone,
				date,
			},
		});

		res.status(201).json({
			message: "Cliente cadastrado com sucesso",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Erro ao buscar dados" });
	}
});

app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`);
});

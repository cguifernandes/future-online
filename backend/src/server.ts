import express from "express";
import { AppDataSource } from "./database/data-source";
import cors from "cors";
import routers from "./router/routes";

const app = express();
require("dotenv").config();

app.use(
	cors({
		origin: "chrome-extension://dahnlbionbfhifkiknhfcefcmdpjille",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(routers);

AppDataSource.initialize()
	.then(async () => {
		app.listen(3333, () => {
			console.log("Server iniciado na porta 3333");
		});
	})
	.catch((error) => {
		console.error("Erro durante a inicialização do Data Source:", error);
	});

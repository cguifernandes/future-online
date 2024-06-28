import { DataSource } from "typeorm";
require("dotenv").config();

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: process.env.DB_PASSWORD,
	database: "future-online",
	synchronize: true,
	logging: false,
	entities: ["src/database/entites/**/*.ts"],
	migrations: ["src/database/migrations/**/*.ts"],
	subscribers: ["src/database/subscribers/**/*.ts"],
});

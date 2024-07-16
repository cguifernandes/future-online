import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Client from "./Client";

@Entity("midia")
class Midia {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column("varchar", { nullable: false })
	title: string;

	@Column("json", { nullable: false })
	file: {
		url: string;
		subtitle: string;
		preview: string | undefined;
		type: "Imagem" | "Vídeo" | "";
	};

	@ManyToOne(
		() => Client,
		(client) => client.midias,
	)
	client: Client;
}

export default Midia;

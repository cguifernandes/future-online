import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Client from "./Client";

@Entity("mensagem")
class Mensagem {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column("varchar", { nullable: false })
	title: string;

	@Column("text", { nullable: false })
	content: string;

	@ManyToOne(
		() => Client,
		(client) => client.mensagens,
	)
	client: Client;
}

export default Mensagem;

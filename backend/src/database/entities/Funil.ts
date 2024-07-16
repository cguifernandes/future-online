import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Client from "./Client";

@Entity("funil")
class Funil {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column("varchar", { nullable: false })
	title: string;

	@Column("json", { nullable: true })
	item: {
		selectedId: string;
		type: "Mensagens" | "Mídias" | "";
		delay: {
			minutes: number;
			seconds: number;
		};
	}[];

	@ManyToOne(
		() => Client,
		(client) => client.funis,
	)
	client: Client;
}

export default Funil;

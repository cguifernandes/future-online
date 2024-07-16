import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Client from "./Client";

@Entity("audio")
class Audio {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column("varchar", { nullable: false })
	title: string;

	@Column("json", { nullable: false })
	audio: {
		url: string;
		preview: string;
	};

	@ManyToOne(
		() => Client,
		(client) => client.audios,
	)
	client: Client;
}

export default Audio;

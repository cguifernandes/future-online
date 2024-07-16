import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import Midia from "./Midia";
import Audio from "./Audio";
import Mensagem from "./Mensagem";
import Funil from "./Funil";
import Gatilho from "./Gatilho";

@Entity("client")
class Client {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { nullable: true })
	name?: string;

	@Column("varchar", { nullable: false, unique: true })
	email: string;

	@Column("varchar", { nullable: false })
	phone: string;

	@Column("varchar", { nullable: false })
	password: string;

	@Column("varchar", { nullable: false })
	date: string;

	@OneToMany(
		() => Midia,
		(midia) => midia.client,
	)
	midias: Midia[];

	@OneToMany(
		() => Audio,
		(audio) => audio.client,
	)
	audios: Audio[];

	@OneToMany(
		() => Mensagem,
		(mensagem) => mensagem.client,
	)
	mensagens: Mensagem[];

	@OneToMany(
		() => Funil,
		(funil) => funil.client,
	)
	funis: Funil[];

	@OneToMany(
		() => Gatilho,
		(gatilho) => gatilho.client,
	)
	gatilhos: Gatilho[];
}

export default Client;

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Client from "./Client";

@Entity("gatilho")
class Gatilho {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column("varchar", { nullable: false })
	title: string;

	@Column("boolean", { nullable: false })
	active: boolean;

	@Column("int", { nullable: false })
	delay: number;

	@Column("boolean", { nullable: false })
	saveContacts: boolean;

	@Column("boolean", { nullable: false })
	sendGroups: boolean;

	@Column("boolean", { nullable: false })
	ignoreCase: boolean;

	@Column("json", { nullable: true })
	keywords?: {
		key?: string[];
		type?: {
			value?: "equals" | "contains" | "startsWith" | "notContains" | "";
			name?:
				| "A mensagem é igual a"
				| "A mensagem contém (alguma)"
				| "A mensagem começa com (alguma)"
				| "A mensagem não contém (nenhuma)"
				| "";
		};
	};

	@Column("json", { nullable: true })
	funil?: {
		id?: string;
		name?: string;
	};

	@ManyToOne(
		() => Client,
		(client) => client.gatilhos,
	)
	client: Client;
}

export default Gatilho;

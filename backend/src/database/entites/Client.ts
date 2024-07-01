import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}

export default Client;

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("client")
class Client {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { nullable: true })
	name?: string;

	@Column("varchar", { nullable: false })
	email: string;

	@Column("varchar", { nullable: false })
	phone: string;

	@Column("date", { nullable: false })
	date: Date;
}

export default Client;

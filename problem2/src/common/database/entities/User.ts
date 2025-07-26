import {
	Entity,
	PrimaryColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
	Index,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import { AuthUser } from "./Auth";
import { v4 as uuidv4 } from "uuid";
import { BaseEntity } from "../Base.entity";

@Entity("users")
@Index(["email"], { unique: true })
@Index(["name"])
@Index(["age"])
export class User extends BaseEntity {
	@Column("varchar", {
		length: 255,
		comment: "Tên đầy đủ của người dùng",
		nullable: false,
	})
	name!: string;

	@Column("varchar", {
		length: 255,
		unique: true,
		comment: "Email duy nhất của người dùng",
		nullable: false,
	})
	email!: string;

	@Column("int", {
		comment: "Tuổi của người dùng",
		nullable: false,
	})
	age!: number;

	@Column("varchar", {
		length: 20,
		default: "active",
		comment: "Trạng thái của người dùng: active, inactive, banned",
	})
	status!: string;

	@OneToOne(() => AuthUser, (authUser) => authUser.user, {
		cascade: true,
		onDelete: "CASCADE",
	})
	authUser!: AuthUser;

	@BeforeInsert()
	@BeforeUpdate()
	validateData() {
		if (this.age < 0 || this.age > 150) {
			throw new Error("Tuổi phải từ 0 đến 150");
		}
		if (!this.email || !this.email.includes("@")) {
			throw new Error("Email không hợp lệ");
		}
	}
}

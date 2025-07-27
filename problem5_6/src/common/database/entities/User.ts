import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	Index,
	OneToMany,
	OneToOne,
} from "typeorm";
import { BaseEntity } from "../Base.entity";
import { AuthUser } from "./Auth";
import { Score } from "./Score";

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

	@OneToMany(() => Score, (score) => score.user, {
		cascade: false,
		onDelete: "CASCADE",
	})
	scores!: Score[];

	totalPoints!: number;
	lastUpdated!: Date;

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

import {
	Entity,
	Column,
	OneToOne,
	JoinColumn,
	Index,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { BaseEntity } from "../Base.entity";

@Entity("auth_users")
@Index(["email"], { unique: true })
@Index(["username"], { unique: true })
@Index(["userId"], { unique: true })
@Index(["role"])
@Index(["isActive"])
export class AuthUser extends BaseEntity {
	@Column("varchar", {
		length: 255,
		unique: true,
		comment: "Tên đăng nhập duy nhất",
		nullable: false,
	})
	username!: string;

	@Column("varchar", {
		length: 255,
		unique: true,
		comment: "Email duy nhất cho đăng nhập",
		nullable: false,
	})
	email!: string;

	@Column("varchar", {
		length: 255,
		comment: "Mật khẩu đã được mã hóa",
		nullable: false,
	})
	password!: string;

	@Column("varchar", {
		length: 10,
		default: "user",
		comment: "Vai trò của người dùng: admin hoặc user",
	})
	role!: "admin" | "user";

	@Column("int", {
		default: 1,
		comment: "Trạng thái hoạt động: 1 = active, 0 = inactive",
	})
	isActive!: boolean;

	@Column("int", {
		comment: "ID tham chiếu đến bảng users",
		nullable: false,
	})
	userId!: number;

	@Column("datetime", {
		nullable: true,
		comment: "Thời gian đăng nhập cuối cùng",
	})
	lastLoginAt?: Date;

	@Column("varchar", {
		length: 500,
		nullable: true,
		comment: "Token refresh để đăng nhập lại",
	})
	refreshToken?: string;

	@OneToOne(() => User, (user) => user.authUser, {
		cascade: false,
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "userId" })
	user!: User;

	// Lifecycle hooks
	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		// Chỉ hash password nếu nó được thay đổi và chưa được hash
		if (this.password && !this.password.startsWith("$2b$")) {
			const saltRounds = 12;
			this.password = await bcrypt.hash(this.password, saltRounds);
		}
	}

	@BeforeInsert()
	@BeforeUpdate()
	validateData() {
		if (!this.username || this.username.length < 3) {
			throw new Error("Username phải có ít nhất 3 ký tự");
		}
		if (!this.email || !this.email.includes("@")) {
			throw new Error("Email không hợp lệ");
		}
		if (!["admin", "user"].includes(this.role)) {
			throw new Error("Role phải là admin hoặc user");
		}
	}

	// Instance methods
	async comparePassword(candidatePassword: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, this.password);
	}

	isAdmin(): boolean {
		return this.role === "admin";
	}

	isActiveUser(): boolean {
		return this.isActive === true;
	}
}

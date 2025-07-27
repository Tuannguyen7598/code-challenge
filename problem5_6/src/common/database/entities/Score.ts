import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import { User } from "./User";
import { BaseEntity } from "../Base.entity";

@Entity("scores")
@Index(["userId"])
export class Score extends BaseEntity {
	@Column("int", {
		comment: "ID của user sở hữu score này",
		nullable: false,
	})
	userId!: number;

	@Column("int", {
		comment: "Điểm số được cộng thêm từ hành động này",
		nullable: false,
		default: 0,
	})
	pointsEarned!: number;

	@Column("varchar", {
		length: 255,
		comment: "Mô tả hành động tạo ra điểm số này",
		nullable: true,
	})
	actionDescription?: string;

	@Column("varchar", {
		length: 50,
		comment: "Loại hành động (game, quiz, challenge, etc.)",
		nullable: true,
	})
	actionType?: string;

	@Column("varchar", {
		length: 500,
		comment: "Metadata bổ sung cho hành động (JSON string)",
		nullable: true,
	})
	metadata?: string;

	@ManyToOne(() => User, (user) => user.scores, {
		cascade: false,
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "userId" })
	user!: User;

	// Lifecycle hooks
	@BeforeInsert()
	@BeforeUpdate()
	validateData() {
		if (this.pointsEarned < 0) {
			throw new Error("Points earned không thể âm");
		}
		if (this.userId <= 0) {
			throw new Error("User ID không hợp lệ");
		}
	}
}

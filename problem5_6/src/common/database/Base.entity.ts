import {
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

export class BaseEntity {
	@PrimaryGeneratedColumn({ type: "int" })
	id!: number;

	@CreateDateColumn({
		comment: "Thời gian tạo bản ghi",
		type: "datetime",
	})
	createdAt!: Date;

	@UpdateDateColumn({
		comment: "Thời gian cập nhật bản ghi cuối cùng",
		type: "datetime",
	})
	updatedAt!: Date;

	@DeleteDateColumn({
		comment: "Thời gian xóa bản ghi",
		type: "datetime",
	})
	deletedAt?: Date;
}

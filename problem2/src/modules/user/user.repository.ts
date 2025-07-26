import { FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { User } from "@/common/database/entities";
import {
	CreateUserRequest,
	UpdateUserRequest,
	UserFilters,
} from "@/common/interfaces/user.interface";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";

export interface IUserRepository {
	create(user: CreateUserRequest): Promise<User>;
	findAll(filters?: UserFilters): Promise<User[]>;
	findAndCountAll(
		filters?: UserFilters
	): Promise<{ users: User[]; total: number }>;
	findById(id: number): Promise<User | null>;
	update(id: number, user: UpdateUserRequest): Promise<User | null>;
	delete(id: number): Promise<boolean>;
	findOne(options: FindOneOptions<User>): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
	private repository: Repository<User>;

	constructor(database: Database, logger: Logger) {
		this.repository = database.getDataSource().getRepository(User);
	}

	async create(userData: CreateUserRequest): Promise<User> {
		const user = this.repository.create({
			...userData,
		});

		const savedUser = await this.repository.save(user);
		return savedUser;
	}

	async findOne(options: FindOneOptions<User>): Promise<User | null> {
		return await this.repository.findOne(options);
	}

	async findAll(filters?: UserFilters): Promise<User[]> {
		const queryBuilder = this.repository.createQueryBuilder("user");

		if (filters?.name) {
			queryBuilder.andWhere("user.name LIKE :name", {
				name: `%${filters.name}%`,
			});
		}

		if (filters?.email) {
			queryBuilder.andWhere("user.email LIKE :email", {
				email: `%${filters.email}%`,
			});
		}

		if (filters?.minAge !== undefined) {
			queryBuilder.andWhere("user.age >= :minAge", { minAge: filters.minAge });
		}

		if (filters?.maxAge !== undefined) {
			queryBuilder.andWhere("user.age <= :maxAge", { maxAge: filters.maxAge });
		}

		queryBuilder.orderBy("user.createdAt", "DESC");

		if (filters?.limit) {
			queryBuilder.limit(filters.limit);
		}

		if (filters?.offset) {
			queryBuilder.offset(filters.offset);
		}

		return await queryBuilder.getMany();
	}

	async findAndCountAll(
		filters?: UserFilters
	): Promise<{ users: User[]; total: number }> {
		const queryBuilder = this.repository.createQueryBuilder("user");

		if (filters?.name) {
			queryBuilder.andWhere("user.name LIKE :name", {
				name: `%${filters.name}%`,
			});
		}

		if (filters?.email) {
			queryBuilder.andWhere("user.email LIKE :email", {
				email: `%${filters.email}%`,
			});
		}

		if (filters?.minAge !== undefined) {
			queryBuilder.andWhere("user.age >= :minAge", { minAge: filters.minAge });
		}

		if (filters?.maxAge !== undefined) {
			queryBuilder.andWhere("user.age <= :maxAge", { maxAge: filters.maxAge });
		}

		queryBuilder.orderBy("user.createdAt", "DESC");

		if (filters?.limit) {
			queryBuilder.limit(filters.limit);
		}

		if (filters?.offset) {
			queryBuilder.offset(filters.offset);
		}

		const [users, total] = await queryBuilder.getManyAndCount();
		return { users, total };
	}

	async findById(id: number): Promise<User | null> {
		return await this.repository.findOne({ where: { id } });
	}

	async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
		const user = await this.repository.findOne({ where: { id } });
		if (!user) {
			return null;
		}

		Object.assign(user, userData);
		return await this.repository.save(user);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.repository.delete(id);
		return (result.affected ?? 0) > 0;
	}
}

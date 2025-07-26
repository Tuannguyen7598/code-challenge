import { FindOneOptions, Repository } from "typeorm";
import { AuthUser } from "@/common/database/entities";
import {
	CreateAuthUserRequest,
	UpdateAuthUserRequest,
	AuthUser as AuthUserInterface,
} from "@/common/interfaces/auth.interface";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import bcrypt from "bcrypt";

export interface IAuthRepository {
	create(userData: CreateAuthUserRequest): Promise<AuthUser>;
	findByEmail(email: string): Promise<AuthUser | null>;
	findByUsername(username: string): Promise<AuthUser | null>;
	findById(id: number): Promise<AuthUser | null>;
	update(id: number, userData: UpdateAuthUserRequest): Promise<AuthUser | null>;
	delete(id: number): Promise<boolean>;
	validateCredentials(
		email: string,
		password: string
	): Promise<AuthUser | null>;
	findOne(options: FindOneOptions<AuthUser>): Promise<AuthUser | null>;
}

export class AuthRepository implements IAuthRepository {
	private repository: Repository<AuthUser>;

	constructor(database: Database, logger: Logger) {
		this.repository = database.getDataSource().getRepository(AuthUser);
	}

	async findOne(options: FindOneOptions<AuthUser>): Promise<AuthUser | null> {
		return await this.repository.findOne(options);
	}

	async create(userData: CreateAuthUserRequest): Promise<AuthUser> {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

		const authUser = this.repository.create({
			username: userData.username,
			email: userData.email,
			password: hashedPassword,
			role: userData.role || "user",
			isActive: true,
			userId: userData.userId,
		});

		const savedAuthUser = await this.repository.save(authUser);
		return savedAuthUser;
	}

	async findByEmail(email: string): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { email } });
	}

	async findByUsername(username: string): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { username } });
	}

	async findById(id: number): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { id } });
	}

	async update(
		id: number,
		userData: UpdateAuthUserRequest
	): Promise<AuthUser | null> {
		const authUser = await this.repository.findOne({ where: { id } });
		if (!authUser) {
			return null;
		}

		// Hash password if provided
		if (userData.password) {
			const saltRounds = 10;
			userData.password = await bcrypt.hash(userData.password, saltRounds);
		}

		Object.assign(authUser, userData);
		return await this.repository.save(authUser);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.repository.delete(id);
		return (result.affected ?? 0) > 0;
	}

	async validateCredentials(
		email: string,
		password: string
	): Promise<AuthUser | null> {
		const authUser = await this.findByEmail(email);
		if (!authUser || !authUser.isActive) {
			return null;
		}

		const isPasswordValid = await bcrypt.compare(password, authUser.password);
		if (!isPasswordValid) {
			return null;
		}

		return authUser;
	}
}

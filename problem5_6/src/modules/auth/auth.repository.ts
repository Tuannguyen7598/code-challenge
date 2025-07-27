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

	/**
	 * Find a user
	 * @param options - The options to find the user with
	 * @returns The user
	 */
	async findOne(options: FindOneOptions<AuthUser>): Promise<AuthUser | null> {
		return await this.repository.findOne(options);
	}

	/**
	 * Create a user
	 * @param userData - The data to create the user with
	 * @returns The created user
	 */
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

	/**
	 * Find a user by email
	 * @param email - The email of the user to find
	 * @returns The user
	 */
	async findByEmail(email: string): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { email } });
	}

	/**
	 * Find a user by username
	 * @param username - The username of the user to find
	 * @returns The user
	 */
	async findByUsername(username: string): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { username } });
	}

	async findById(id: number): Promise<AuthUser | null> {
		return await this.repository.findOne({ where: { id } });
	}

	/**
	 * Update a user
	 * @param id - The ID of the user to update
	 * @param userData - The data to update the user with
	 * @returns The updated user
	 */
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

	/**
	 * Delete a user
	 * @param id - The ID of the user to delete
	 * @returns void
	 */
	async delete(id: number): Promise<boolean> {
		const result = await this.repository.delete(id);
		return (result.affected ?? 0) > 0;
	}

	/**
	 * Validate credentials
	 * @param email - The email of the user
	 * @param password - The password of the user
	 * @returns The user
	 */
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

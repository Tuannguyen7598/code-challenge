import { User } from "@/common/database/entities";
import {
	CreateUserRequest,
	UpdateUserRequest,
	UserFilters,
} from "@/common/interfaces/user.interface";
import { IUserRepository } from "./user.repository";
import { Logger } from "@/common/logger/Logger";
import { ValidationHelper } from "@/common/utils/ValidationHelper";
import {
	ValidationError,
	NotFoundError,
	ConflictError,
} from "@/common/exceptions";

export class UserService {
	constructor(
		private userRepository: IUserRepository,
		private logger: Logger
	) {}

	async validateUser(userData: CreateUserRequest): Promise<void> {
		const existingUser = await this.userRepository.findOne({
			where: {
				email: userData.email,
			},
		});
		if (existingUser) {
			throw new ConflictError("User already exists");
		}
	}

	async createUser(userData: CreateUserRequest): Promise<User> {
		this.logger.info("Creating new user", { email: userData.email });

		// Validate email format
		if (!ValidationHelper.isValidEmail(userData.email)) {
			throw new ValidationError("Invalid email format");
		}

		// Validate age
		if (!ValidationHelper.isValidAge(userData.age)) {
			throw new ValidationError("Invalid age");
		}

		const user = await this.userRepository.create(userData);
		this.logger.info("User created successfully", { userId: user.id });
		return user;
	}

	async getAllUsers(
		filters?: UserFilters & { page?: number; page_size?: number }
	): Promise<{
		users: User[];
		total: number;
		page: number;
		page_size: number;
	}> {
		this.logger.info("Fetching all users", { filters });
		const page = filters?.page ?? 1;
		const page_size = filters?.page_size ?? filters?.limit ?? 10;
		const offset = (page - 1) * page_size;
		const limit = page_size;
		const { users, total } = await this.userRepository.findAndCountAll({
			...filters,
			limit,
			offset,
		});
		return { users, total, page, page_size };
	}

	async getUserById(id: string): Promise<User> {
		this.logger.info("Fetching user by ID", { userId: id });
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError("User not found");
		}
		return user;
	}

	async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
		this.logger.info("Updating user", { userId: id, updates: userData });

		// Validate email format if provided
		if (userData.email && !ValidationHelper.isValidEmail(userData.email)) {
			throw new ValidationError("Invalid email format");
		}

		// Validate age if provided
		if (
			userData.age !== undefined &&
			!ValidationHelper.isValidAge(userData.age)
		) {
			throw new ValidationError("Invalid age");
		}

		const user = await this.userRepository.update(id, userData);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		this.logger.info("User updated successfully", { userId: id });
		return user;
	}

	async deleteUser(id: string): Promise<void> {
		this.logger.info("Deleting user", { userId: id });
		const deleted = await this.userRepository.delete(id);
		if (!deleted) {
			throw new NotFoundError("User not found");
		}
		this.logger.info("User deleted successfully", { userId: id });
	}
}

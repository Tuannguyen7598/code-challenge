import { AuthUser } from "@/common/database/entities";
import {
	LoginRequest,
	AuthResponse,
	CreateAuthUserRequest,
} from "@/common/interfaces/auth.interface";
import { Logger } from "@/common/logger/Logger";
import { ValidationHelper } from "@/common/utils/ValidationHelper";
import { JwtHelper } from "@/common/utils/JwtHelper";
import { IAuthRepository } from "./auth.repository";
import { IUserRepository } from "../user/user.repository";
import {
	ValidationError,
	AuthenticationError,
	ConflictError,
} from "@/common/exceptions";

export class AuthService {
	constructor(
		private authRepository: IAuthRepository,
		private userRepository: IUserRepository,
		private logger: Logger
	) {}

	async register(userData: AuthUser): Promise<AuthResponse> {
		this.logger.info("Registering new user", { email: userData.email });

		// Validate email format
		if (!ValidationHelper.isValidEmail(userData.email)) {
			throw new ValidationError("Invalid email format");
		}

		// Validate password strength
		if (userData.password.length < 6) {
			throw new ValidationError("Password must be at least 6 characters long");
		}

		// Check if user already exists
		const existingUser = await this.authRepository.findByEmail(userData.email);
		if (existingUser) {
			throw new ConflictError("User with this email already exists");
		}

		const existingUsername = await this.authRepository.findByUsername(
			userData.username
		);
		if (existingUsername) {
			throw new ConflictError("Username already taken");
		}

		// Create user in users table first
		const user = await this.userRepository.create({
			name: userData.username,
			email: userData.email,
			age: 0, // Default age, can be updated later
		});

		// Create auth user
		const authUserData: CreateAuthUserRequest = {
			username: userData.username,
			email: userData.email,
			password: userData.password,
			role: userData.role || "user",
			userId: user.id,
		};

		const authUser = await this.authRepository.create(authUserData);

		// Generate JWT token
		const token = JwtHelper.generateToken({
			userId: authUser.id,
			email: authUser.email,
			role: authUser.role,
		});

		this.logger.info("User registered successfully", { userId: authUser.id });

		return {
			user: {
				id: authUser.id,
				username: authUser.username,
				email: authUser.email,
				role: authUser.role,
				isActive: authUser.isActive,
				userId: authUser.userId,
				createdAt: authUser.createdAt,
				updatedAt: authUser.updatedAt,
			},
			token,
		};
	}

	async login(loginData: LoginRequest): Promise<AuthResponse> {
		this.logger.info("User login attempt", { email: loginData.email });

		// Validate credentials
		const authUser = await this.authRepository.validateCredentials(
			loginData.email,
			loginData.password
		);

		if (!authUser) {
			throw new AuthenticationError("Invalid email or password");
		}

		if (!authUser.isActive) {
			throw new AuthenticationError("Account is deactivated");
		}

		// Generate JWT token
		const token = JwtHelper.generateToken({
			userId: authUser.id,
			email: authUser.email,
			role: authUser.role,
		});

		this.logger.info("User logged in successfully", { userId: authUser.id });

		return {
			user: {
				id: authUser.id,
				username: authUser.username,
				email: authUser.email,
				role: authUser.role,
				isActive: authUser.isActive,
				userId: authUser.userId,
				createdAt: authUser.createdAt,
				updatedAt: authUser.updatedAt,
			},
			token,
		};
	}

	async logout(userId: number): Promise<void> {
		this.logger.info("User logout", { userId });
		// In a real application, you might want to:
		// 1. Add the token to a blacklist
		// 2. Update last logout time
		// 3. Clear session data
		// For now, we just log the logout
	}

	async validateToken(token: string): Promise<AuthUser | null> {
		try {
			const payload = JwtHelper.verifyToken(token);
			const authUser = await this.authRepository.findOne({
				where: { id: payload.userId },
			});
			return authUser;
		} catch (error) {
			return null;
		}
	}
}

import { Router } from "express";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthRoutes } from "./auth.routes";
import { AuthRepository } from "./auth.repository";
import { UserRepository } from "../user/user.repository";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import { ErrorHandler } from "@/common/middleware/ErrorHandler";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";

export class AuthModule {
	private router: Router;
	private authRepository: AuthRepository;
	private userRepository: UserRepository;
	private authService: AuthService;
	private authController: AuthController;
	private authRoutes: AuthRoutes;
	private authMiddleware: AuthMiddleware;
	private errorHandler: ErrorHandler;

	constructor(database: Database, logger: Logger) {
		// Initialize repositories
		this.authRepository = new AuthRepository(database, logger);
		this.userRepository = new UserRepository(database, logger);

		// Initialize services and middleware
		this.authService = new AuthService(
			this.authRepository,
			this.userRepository,
			logger
		);
		this.authController = new AuthController(this.authService, logger);
		this.authMiddleware = new AuthMiddleware(logger);
		this.authRoutes = new AuthRoutes(this.authController, this.authMiddleware);
		this.errorHandler = new ErrorHandler(logger);

		// Initialize router
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Apply validation middleware to all auth routes
		this.router.use(
			"/api/auth",
			this.errorHandler.handleValidationErrors.bind(this.errorHandler)
		);
		this.router.use("/api/auth", this.authRoutes.getRouter());
	}

	getRouter(): Router {
		return this.router;
	}

	// Getter methods for dependency injection if needed
	getAuthService(): AuthService {
		return this.authService;
	}

	getAuthController(): AuthController {
		return this.authController;
	}

	getAuthRepository(): AuthRepository {
		return this.authRepository;
	}
}

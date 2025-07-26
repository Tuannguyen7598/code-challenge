import { Router } from "express";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserRoutes } from "./user.routes";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import { ErrorHandler } from "@/common/middleware/ErrorHandler";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";

export class UserModule {
	private router: Router;
	private userRepository: UserRepository;
	private userService: UserService;
	private userController: UserController;
	private userRoutes: UserRoutes;
	private authMiddleware: AuthMiddleware;
	private errorHandler: ErrorHandler;

	constructor(database: Database, logger: Logger) {
		// Initialize dependencies
		this.userRepository = new UserRepository(database, logger);
		this.userService = new UserService(this.userRepository, logger);
		this.userController = new UserController(this.userService, logger);
		this.authMiddleware = new AuthMiddleware(logger);
		this.userRoutes = new UserRoutes(this.userController, this.authMiddleware);
		this.errorHandler = new ErrorHandler(logger);

		// Initialize router
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Apply validation middleware to all user routes
		this.router.use(
			"/api/users",
			this.errorHandler.handleValidationErrors.bind(this.errorHandler)
		);
		this.router.use("/api/users", this.userRoutes.getRouter());
	}

	getRouter(): Router {
		return this.router;
	}

	// Getter methods for dependency injection if needed
	getUserRepository(): UserRepository {
		return this.userRepository;
	}

	getUserService(): UserService {
		return this.userService;
	}

	getUserController(): UserController {
		return this.userController;
	}
}

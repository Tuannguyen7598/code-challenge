import { Router } from "express";
import { ScoreRepository } from "./score.repository";
import { ScoreService } from "./score.service";
import { ScoreController } from "./score.controller";
import { ScoreRoutes } from "./score.routes";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import { ErrorHandler } from "@/common/middleware/ErrorHandler";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";

export class ScoreModule {
	private router: Router;
	private scoreRepository: ScoreRepository;
	private scoreService: ScoreService;
	private scoreController: ScoreController;
	private scoreRoutes: ScoreRoutes;
	private authMiddleware: AuthMiddleware;
	private errorHandler: ErrorHandler;

	constructor(database: Database, logger: Logger) {
		this.scoreRepository = new ScoreRepository(database, logger);
		this.scoreService = new ScoreService(this.scoreRepository, logger);
		this.scoreController = new ScoreController(this.scoreService, logger);
		this.authMiddleware = new AuthMiddleware(logger);
		this.scoreRoutes = new ScoreRoutes(
			this.scoreController,
			this.authMiddleware
		);
		this.errorHandler = new ErrorHandler(logger);

		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.use(
			"/api/scores",
			this.errorHandler.handleValidationErrors.bind(this.errorHandler)
		);
		this.router.use("/api/scores", this.scoreRoutes.getRouter());
	}

	getRouter(): Router {
		return this.router;
	}

	getScoreRepository(): ScoreRepository {
		return this.scoreRepository;
	}

	getScoreService(): ScoreService {
		return this.scoreService;
	}

	getScoreController(): ScoreController {
		return this.scoreController;
	}
}

import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { Logger } from "./common/logger/Logger";
import { Database } from "./common/database/Database";
import { ErrorHandler } from "./common/middleware/ErrorHandler";
import { ExceptionFilter } from "./common/middleware/ExceptionFilter";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AppConfig } from "./Config";
import { HealthService } from "./common/health/HealthService";

export class App {
	private app: express.Application;
	private logger: Logger;
	private database: Database;
	private healthService: HealthService;
	private server: any;

	constructor() {
		// Load environment variables

		this.app = express();
		this.logger = new Logger();
		this.database = new Database(this.logger);
		this.healthService = new HealthService(this.database, this.logger);

		this.initializeMiddleware();
		this.initializeModules();
		this.initializeErrorHandling();
	}

	private initializeMiddleware(): void {
		// Security middleware
		this.app.use(helmet());

		// CORS
		this.app.use(
			cors({
				origin: AppConfig.cors.origin,
				credentials: true,
			})
		);

		// Compression
		this.app.use(compression());

		// Body parsing
		this.app.use(express.json({ limit: "10mb" }));
		this.app.use(express.urlencoded({ extended: true }));

		// Request logging
		this.app.use((req, res, next) => {
			this.logger.info(`${req.method} ${req.path}`, {
				ip: req.ip,
				userAgent: req.get("User-Agent"),
			});
			next();
		});
	}

	private initializeModules(): void {
		// Health check endpoints
		this.app.get("/health/liveness", async (req, res) => {
			try {
				const health = await this.healthService.getSimpleHealth();
				const statusCode = health.status === "ok" ? 200 : 503;

				res.status(statusCode).json({
					status: health.status,
					timestamp: health.timestamp,
					service: "crud-server",
					endpoint: "liveness",
				});
			} catch (error) {
				this.logger.error("Liveness check failed", { error });
				res.status(503).json({
					status: "error",
					timestamp: new Date().toISOString(),
					service: "crud-server",
					endpoint: "liveness",
					message: "Service is not alive",
				});
			}
		});

		this.app.get("/health/readiness", async (req, res) => {
			try {
				const health = await this.healthService.getHealthStatus();
				const statusCode = health.status === "healthy" ? 200 : 503;

				res.status(statusCode).json({
					status: health.status,
					timestamp: health.timestamp,
					uptime: health.uptime,
					version: health.version,
					environment: health.environment,
					service: "crud-server",
					endpoint: "readiness",
					services: health.services,
					checks: health.checks,
				});
			} catch (error) {
				this.logger.error("Readiness check failed", { error });
				res.status(503).json({
					status: "unhealthy",
					timestamp: new Date().toISOString(),
					service: "crud-server",
					endpoint: "readiness",
					message: "Service is not ready",
				});
			}
		});

		// Legacy health check (for backward compatibility)
		this.app.get("/health", async (req, res) => {
			try {
				const health = await this.healthService.getSimpleHealth();
				const statusCode = health.status === "ok" ? 200 : 503;

				res.status(statusCode).json({
					success: health.status === "ok",
					message:
						health.status === "ok"
							? "Server is running"
							: "Server is not healthy",
					timestamp: health.timestamp,
					status: health.status,
				});
			} catch (error) {
				this.logger.error("Health check failed", { error });
				res.status(503).json({
					success: false,
					message: "Server is not healthy",
					timestamp: new Date().toISOString(),
					status: "error",
				});
			}
		});

		// Initialize modules
		const userModule = new UserModule(this.database, this.logger);
		const authModule = new AuthModule(this.database, this.logger);

		// Apply module routes
		this.app.use(userModule.getRouter());
		this.app.use(authModule.getRouter());
	}

	private initializeErrorHandling(): void {
		const errorHandler = new ErrorHandler(this.logger);
		const exceptionFilter = new ExceptionFilter(this.logger);

		// 404 handler
		this.app.use("*", errorHandler.handleNotFound.bind(errorHandler));

		// Global exception filter (must be last)
		this.app.use(
			(error: Error, req: Request, res: Response, next: NextFunction) => {
				exceptionFilter.handle(error, req, res, next);
			}
		);
	}

	async start(): Promise<void> {
		try {
			// Connect to database
			await this.database.connect();

			const port = AppConfig.port;

			this.server = this.app.listen(port, () => {
				this.logger.info(`Server started on port ${port}`, {
					port,
					environment: AppConfig.env,
				});
			});

			// Graceful shutdown
			process.on("SIGTERM", () => this.gracefulShutdown());
			process.on("SIGINT", () => this.gracefulShutdown());
		} catch (error) {
			this.logger.error("Failed to start server", { error });
			process.exit(1);
		}
	}

	private async gracefulShutdown(): Promise<void> {
		this.logger.info("Shutting down server gracefully...");

		if (this.server) {
			this.server.close(async () => {
				await this.database.close();
				this.logger.info("Server shutdown complete");
				process.exit(0);
			});
		}
	}

	getApp(): express.Application {
		return this.app;
	}
}

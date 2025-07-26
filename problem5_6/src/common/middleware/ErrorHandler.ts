import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Logger } from "../logger/Logger";

export class ErrorHandler {
	constructor(private logger: Logger) {}

	handleValidationErrors(
		req: Request,
		res: Response,
		next: NextFunction
	): void {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			this.logger.warn("Validation errors", {
				path: req.path,
				method: req.method,
				errors: errors.array(),
			});

			res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
			return;
		}
		next();
	}

	handleGlobalErrors(
		err: Error,
		req: Request,
		res: Response,
		next: NextFunction
	): void {
		this.logger.error("Unhandled error", {
			error: err.message,
			stack: err.stack,
			path: req.path,
			method: req.method,
		});

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}

	handleNotFound(req: Request, res: Response): void {
		this.logger.warn("Route not found", {
			path: req.path,
			method: req.method,
		});

		res.status(404).json({
			success: false,
			message: "Route not found",
		});
	}
}

import { Request, Response, NextFunction } from "express";
import { Logger } from "@/common/logger/Logger";
import { ResponseHelper } from "@/common/utils/ResponseHelper";
import {
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	NotFoundError,
	ConflictError,
} from "@/common/exceptions";

export class ExceptionFilter {
	constructor(private logger: Logger) {}

	/**
	 * Handle an exception
	 * @param error - The error to handle
	 * @param req - The request object
	 * @param res - The response object
	 * @param next - The next function
	 */
	handle = (
		error: Error,
		req: Request,
		res: Response,
		next: NextFunction
	): void => {
		// Log error
		this.logger.error("Exception occurred", {
			error: error.message,
			stack: error.stack,
			method: req.method,
			path: req.path,
			ip: req.ip,
			userAgent: req.get("User-Agent"),
		});

		// Handle specific error types
		if (error instanceof ValidationError) {
			ResponseHelper.badRequest(res, error.message);
			return;
		}

		if (error instanceof AuthenticationError) {
			ResponseHelper.unauthorized(res, error.message);
			return;
		}

		if (error instanceof AuthorizationError) {
			ResponseHelper.forbidden(res, error.message);
			return;
		}

		if (error instanceof NotFoundError) {
			ResponseHelper.notFound(res, error.message);
			return;
		}

		if (error instanceof ConflictError) {
			ResponseHelper.conflict(res, error.message);
			return;
		}

		// Handle common error messages
		if (error.message.includes("not found")) {
			ResponseHelper.notFound(res, error.message);
		} else if (
			error.message.includes("Invalid") ||
			error.message.includes("invalid")
		) {
			ResponseHelper.badRequest(res, error.message);
		} else if (
			error.message.includes("Unauthorized") ||
			error.message.includes("authentication")
		) {
			ResponseHelper.unauthorized(res, error.message);
		} else if (
			error.message.includes("Forbidden") ||
			error.message.includes("permission")
		) {
			ResponseHelper.forbidden(res, error.message);
		} else if (
			error.message.includes("already exists") ||
			error.message.includes("duplicate")
		) {
			ResponseHelper.conflict(res, error.message);
		} else {
			// Default internal server error
			ResponseHelper.error(res, "Internal server error", 500);
		}
	};
}

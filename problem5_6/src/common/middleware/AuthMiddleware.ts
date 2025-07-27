import { Request, Response, NextFunction } from "express";
import { JwtHelper, JwtPayload } from "@/common/utils/JwtHelper";
import { Logger } from "@/common/logger/Logger";

export interface AuthenticatedRequest extends Request {
	user?: JwtPayload;
}

export class AuthMiddleware {
	constructor(private logger: Logger) {}

	/**
	 * Authenticate a request
	 * @param req - The request object
	 * @param res - The response object
	 * @param next - The next function
	 */
	authenticate = (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		try {
			const authHeader = req.headers.authorization;

			if (!authHeader) {
				res.status(401).json({ error: "Authorization header is required" });
				return;
			}

			const token = authHeader.replace("Bearer ", "");

			if (!token) {
				res.status(401).json({ error: "Token is required" });
				return;
			}

			const decoded = JwtHelper.verifyToken(token);
			req.user = decoded;

			this.logger.info("User authenticated", {
				userId: decoded.userId,
				email: decoded.email,
				role: decoded.role,
			});

			next();
		} catch (error) {
			this.logger.error("Authentication failed", {
				error: (error as Error).message,
			});
			res.status(401).json({ error: "Invalid or expired token" });
		}
	};

	/**
	 * Authorize a request
	 * @param roles - The roles to authorize
	 * @returns The authorized request
	 */
	authorize = (roles: string[]) => {
		return (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): void => {
			if (!req.user) {
				res.status(401).json({ error: "User not authenticated" });
				return;
			}

			if (!roles.includes(req.user.role)) {
				this.logger.warn("Access denied", {
					userId: req.user.userId,
					userRole: req.user.role,
					requiredRoles: roles,
				});
				res.status(403).json({ error: "Insufficient permissions" });
				return;
			}

			this.logger.info("User authorized", {
				userId: req.user.userId,
				role: req.user.role,
			});

			next();
		};
	};

	/**
	 * Optional authentication
	 * @param req - The request object
	 * @param res - The response object
	 * @param next - The next function
	 */
	optionalAuth = (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		try {
			const authHeader = req.headers.authorization;

			if (!authHeader) {
				next();
				return;
			}

			const token = authHeader.replace("Bearer ", "");

			if (!token) {
				next();
				return;
			}

			const decoded = JwtHelper.verifyToken(token);
			req.user = decoded;

			this.logger.info("Optional authentication successful", {
				userId: decoded.userId,
				email: decoded.email,
			});

			next();
		} catch (error) {
			// For optional auth, we just continue without setting req.user
			this.logger.debug(
				"Optional authentication failed, continuing without user",
				{
					error: (error as Error).message,
				}
			);
			next();
		}
	};
}

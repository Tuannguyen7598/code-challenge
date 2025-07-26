import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthUser } from "@/common/database/entities/Auth";
import { Logger } from "@/common/logger/Logger";
import { ResponseHelper } from "@/common/utils/ResponseHelper";
import { AuthenticatedRequest } from "@/common/middleware/AuthMiddleware";
import { AuthenticationError } from "@/common/exceptions";

export class AuthController {
	constructor(private authService: AuthService, private logger: Logger) {}

	async register(req: Request, res: Response): Promise<void> {
		const userData: AuthUser = req.body;
		const result = await this.authService.register(userData);

		ResponseHelper.created(res, result, "User registered successfully");
	}

	async login(req: Request, res: Response): Promise<void> {
		const loginData: AuthUser = req.body;
		const result = await this.authService.login(loginData);

		ResponseHelper.success(res, result, "Login successful");
	}

	async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
		if (!req.user?.userId) {
			throw new AuthenticationError("User not authenticated");
		}
		const userId = req.user.userId;
		await this.authService.logout(userId);

		ResponseHelper.success(res, null, "Logout successful");
	}

	async getCurrentUser(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		if (!req.user) {
			throw new AuthenticationError("User not authenticated");
		}

		ResponseHelper.success(
			res,
			req.user,
			"Current user retrieved successfully"
		);
	}
}

import { Router, Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";
import { body } from "express-validator";

export class AuthRoutes {
	private router: Router;
	private authController: AuthController;
	private authMiddleware: AuthMiddleware;

	constructor(authController: AuthController, authMiddleware: AuthMiddleware) {
		this.router = Router();
		this.authController = authController;
		this.authMiddleware = authMiddleware;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Register
		this.router.post(
			"/register",
			[
				body("username")
					.isString()
					.trim()
					.isLength({ min: 3, max: 50 })
					.withMessage("Username must be between 3-50 characters"),
				body("email")
					.isEmail()
					.normalizeEmail()
					.withMessage("Valid email is required"),
				body("password")
					.isLength({ min: 6 })
					.withMessage("Password must be at least 6 characters long"),
			],
			(req: Request, res: Response) => this.authController.register(req, res)
		);

		// Login
		this.router.post(
			"/login",
			[
				body("email")
					.isEmail()
					.normalizeEmail()
					.withMessage("Valid email is required"),
				body("password").notEmpty().withMessage("Password is required"),
			],
			(req: Request, res: Response) => this.authController.login(req, res)
		);

		// Logout (requires authentication)
		this.router.post(
			"/logout",
			this.authMiddleware.authenticate,
			(req: Request, res: Response) => this.authController.logout(req, res)
		);

		// Get current user (requires authentication)
		this.router.get(
			"/me",
			this.authMiddleware.authenticate,
			(req: Request, res: Response) =>
				this.authController.getCurrentUser(req, res)
		);
	}

	getRouter(): Router {
		return this.router;
	}
}

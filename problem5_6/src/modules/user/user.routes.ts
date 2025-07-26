import { Router, Request, Response } from "express";
import { UserController } from "./user.controller";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";
import { body, param, query } from "express-validator";

export class UserRoutes {
	private router: Router;
	private userController: UserController;
	private authMiddleware: AuthMiddleware;

	constructor(userController: UserController, authMiddleware: AuthMiddleware) {
		this.router = Router();
		this.userController = userController;
		this.authMiddleware = authMiddleware;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Create user (requires authentication)
		this.router.post(
			"/",
			this.authMiddleware.authenticate,
			[
				body("name")
					.isString()
					.trim()
					.isLength({ min: 1, max: 100 })
					.withMessage("Name is required and must be between 1-100 characters"),
				body("email")
					.isEmail()
					.normalizeEmail()
					.withMessage("Valid email is required"),
				body("age")
					.isInt({ min: 0, max: 150 })
					.withMessage("Age must be between 0-150"),
			],
			(req: Request, res: Response) => this.userController.createUser(req, res)
		);

		// Get all users with filters (requires authentication)
		this.router.get(
			"/",
			this.authMiddleware.authenticate,
			[
				query("name").optional().isString().trim(),
				query("email").optional().isEmail().normalizeEmail(),
				query("minAge").optional().isInt({ min: 0, max: 150 }),
				query("maxAge").optional().isInt({ min: 0, max: 150 }),
				query("limit").optional().isInt({ min: 1, max: 100 }),
				query("offset").optional().isInt({ min: 0 }),
			],
			(req: Request, res: Response) => this.userController.getAllUsers(req, res)
		);

		// Get user by ID (requires authentication)
		this.router.get(
			"/:id",
			this.authMiddleware.authenticate,
			[param("id").isUUID().withMessage("Invalid user ID format")],
			(req: Request, res: Response) => this.userController.getUserById(req, res)
		);

		// Update user (requires authentication)
		this.router.put(
			"/:id",
			this.authMiddleware.authenticate,
			[
				param("id").isUUID().withMessage("Invalid user ID format"),
				body("name")
					.optional()
					.isString()
					.trim()
					.isLength({ min: 1, max: 100 }),
				body("email").optional().isEmail().normalizeEmail(),
				body("age").optional().isInt({ min: 0, max: 150 }),
			],
			(req: Request, res: Response) => this.userController.updateUser(req, res)
		);

		// Delete user (requires admin role)
		this.router.delete(
			"/:id",
			this.authMiddleware.authenticate,
			this.authMiddleware.authorize(["admin"]),
			[param("id").isUUID().withMessage("Invalid user ID format")],
			(req: Request, res: Response) => this.userController.deleteUser(req, res)
		);
	}

	getRouter(): Router {
		return this.router;
	}
}

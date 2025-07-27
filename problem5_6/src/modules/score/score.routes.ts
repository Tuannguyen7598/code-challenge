import { Router, Request, Response } from "express";
import { ScoreController } from "./score.controller";
import { AuthMiddleware } from "@/common/middleware/AuthMiddleware";
import { body, param, query } from "express-validator";

export class ScoreRoutes {
	private router: Router;
	private scoreController: ScoreController;
	private authMiddleware: AuthMiddleware;

	constructor(
		scoreController: ScoreController,
		authMiddleware: AuthMiddleware
	) {
		this.router = Router();
		this.scoreController = scoreController;
		this.authMiddleware = authMiddleware;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Lấy score của user (yêu cầu authentication)
		this.router.get(
			"/user/:userId",
			this.authMiddleware.authenticate,
			[
				param("userId")
					.isInt({ min: 1 })
					.withMessage("User ID must be a positive integer"),
			],
			(req: Request, res: Response) =>
				this.scoreController.getScoreByUserId(req, res)
		);

		// Lấy tất cả scores với filter (yêu cầu authentication)
		this.router.get(
			"/",
			this.authMiddleware.authenticate,
			[
				query("userId").optional().isInt({ min: 1 }),
				query("actionType").optional().isString().trim(),
				query("minScore").optional().isInt({ min: 0 }),
				query("maxScore").optional().isInt({ min: 0 }),
				query("limit").optional().isInt({ min: 1, max: 100 }),
				query("offset").optional().isInt({ min: 0 }),
				query("page").optional().isInt({ min: 1 }),
				query("page_size").optional().isInt({ min: 1, max: 100 }),
			],
			(req: Request, res: Response) =>
				this.scoreController.getAllScores(req, res)
		);

		// Lấy scoreboard (top 10 scores) - public endpoint
		this.router.get(
			"/scoreboard",
			[query("limit").optional().isInt({ min: 1, max: 100 })],
			(req: Request, res: Response) =>
				this.scoreController.getScoreboard(req, res)
		);

		// Tăng điểm số từ hành động (API chính cho frontend) - yêu cầu authentication
		this.router.post(
			"/action",
			this.authMiddleware.authenticate,
			[
				body("actionDescription")
					.isString()
					.trim()
					.isLength({ min: 1, max: 255 })
					.withMessage(
						"Action description is required and must be between 1-255 characters"
					),
				body("actionType")
					.optional()
					.isString()
					.trim()
					.isLength({ min: 1, max: 50 })
					.withMessage("Action type must be between 1-50 characters"),
				body("metadata")
					.optional()
					.isString()
					.trim()
					.isLength({ max: 500 })
					.withMessage("Metadata must not exceed 500 characters"),
			],
			(req: Request, res: Response) =>
				this.scoreController.handleAction(req, res)
		);
	}

	getRouter(): Router {
		return this.router;
	}
}

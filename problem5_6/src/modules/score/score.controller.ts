import { Request, Response } from "express";
import { ScoreService } from "./score.service";
import { Logger } from "@/common/logger/Logger";
import { ResponseHelper } from "@/common/utils/ResponseHelper";
import { AuthenticatedRequest } from "@/common/middleware/AuthMiddleware";

export class ScoreController {
	constructor(private scoreService: ScoreService, private logger: Logger) {}

	/**
	 * Get score of user
	 * @param req
	 * @param res
	 * @returns
	 */
	async getScoreByUserId(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		const userId = parseInt(req.params.userId);
		const score = await this.scoreService.getScoreByUserId(userId);

		ResponseHelper.success(res, score, "Score retrieved successfully");
	}

	/**
	 * Get all scores with filter
	 * @param req
	 * @param res
	 * @returns
	 */
	async getAllScores(req: Request, res: Response): Promise<void> {
		const filters = {
			userId: req.query.userId
				? parseInt(req.query.userId as string)
				: undefined,
			actionType: req.query.actionType as string,
			minScore: req.query.minScore
				? parseInt(req.query.minScore as string)
				: undefined,
			maxScore: req.query.maxScore
				? parseInt(req.query.maxScore as string)
				: undefined,
			limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
			offset: req.query.offset
				? parseInt(req.query.offset as string)
				: undefined,
			page: req.query.page ? parseInt(req.query.page as string) : undefined,
			page_size: req.query.page_size
				? parseInt(req.query.page_size as string)
				: undefined,
		};

		const result = await this.scoreService.getAllScores(filters);

		ResponseHelper.success(res, result, "Scores retrieved successfully");
	}

	/**
	 * Get scoreboard (top 10 users with total score)
	 * @param req
	 * @param res
	 * @returns
	 */
	async getScoreboard(req: Request, res: Response): Promise<void> {
		const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
		const scoreboard = await this.scoreService.getScoreboard(limit);

		ResponseHelper.success(
			res,
			scoreboard,
			"Scoreboard retrieved successfully"
		);
	}

	/**
	 * Handle logic when user action
	 * @param req
	 * @param res
	 * @returns
	 */
	async handleAction(req: AuthenticatedRequest, res: Response): Promise<void> {
		const { pointsToAdd, actionDescription, actionType, metadata } = req.body;
		const userId = req.user?.userId as number;
		let isSuccess = false;
		const queryRunner = this.scoreService.getQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction("SERIALIZABLE");
		try {
			// some logic when user action
			const action = await this.scoreService.handleAction(
				userId,
				actionDescription,
				actionType,
				metadata,
				queryRunner
			);
			// ...
			const pointsToAdd = action.pointsToAdd;
			// add points to user after action
			await this.scoreService.addPointsFromAction(
				userId,
				pointsToAdd,
				actionDescription,
				actionType,
				metadata,
				queryRunner
			);
			isSuccess = true;
			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
		if (isSuccess) {
			await this.scoreService.notificationScoreOfUserUpdated(userId);
		}
		ResponseHelper.success(
			res,
			{ status: "success" },
			"Action handled successfully"
		);
	}
}

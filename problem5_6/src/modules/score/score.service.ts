import { Score } from "../../common/database/entities/Score";
import {
	CreateScoreRequest,
	UpdateScoreRequest,
	ScoreFilters,
	ScoreboardResponse,
	ScoreboardEntry,
	ScoreHistoryResponse,
} from "@/common/interfaces/score.interface";
import { IScoreRepository } from "./score.repository";
import { Logger } from "@/common/logger/Logger";
import { ValidationHelper } from "@/common/utils/ValidationHelper";
import {
	ValidationError,
	NotFoundError,
	ConflictError,
	AuthenticationError,
} from "@/common/exceptions";
import { QueryRunner } from "typeorm";

export class ScoreService {
	constructor(
		private scoreRepository: IScoreRepository,
		private logger: Logger
	) {}

	getQueryRunner(): QueryRunner {
		return this.scoreRepository.getQueryRunner();
	}

	async handleAction(
		userId: number,
		actionDescription: string,
		actionType: string,
		metadata: string,
		queryRunner: QueryRunner
	): Promise<{
		pointsToAdd: number;
	}> {
		this.logger.info("Handling action", {
			userId,
			actionDescription,
			actionType,
			metadata,
		});
		return {
			pointsToAdd: 100,
		};
	}

	/**
	 * Lấy score của user
	 */
	async getScoreByUserId(userId: number): Promise<Score> {
		this.logger.info("Fetching score by user ID", { userId });

		if (!ValidationHelper.isValidUserId(userId)) {
			throw new ValidationError("Invalid user ID");
		}

		const score = await this.scoreRepository.findByUserId(userId);
		if (!score) {
			throw new NotFoundError("Score not found for this user");
		}

		return score;
	}

	/**
	 * Lấy tất cả scores với filter
	 */
	async getAllScores(
		filters?: ScoreFilters & { page?: number; page_size?: number }
	): Promise<{
		scores: Score[];
		total: number;
		page: number;
		page_size: number;
	}> {
		this.logger.info("Fetching all scores", { filters });

		const page = filters?.page ?? 1;
		const page_size = filters?.page_size ?? filters?.limit ?? 10;
		const offset = (page - 1) * page_size;

		const { scores, total } = await this.scoreRepository.findAll({
			...filters,
			limit: page_size,
			offset,
		});

		return { scores, total, page, page_size };
	}

	/**
	 * Lấy scoreboard (top 10 scores)
	 */
	async getScoreboard(limit: number = 10): Promise<ScoreboardResponse> {
		this.logger.info("Fetching scoreboard", { limit });

		if (limit <= 0 || limit > 100) {
			throw new ValidationError("Limit must be between 1 and 100");
		}

		const users = await this.scoreRepository.getScoreboard(limit);

		const entries: ScoreboardEntry[] = users.map((user, index) => ({
			rank: index + 1,
			userId: user.id,
			userName: user.name,
			userEmail: user.email,
			totalScore: user.totalPoints,
			lastUpdated: user.lastUpdated,
		}));

		return {
			entries,
			total: entries.length,
			lastUpdated: new Date(),
		};
	}

	/**
	 * Add points from action (main API for frontend)
	 * @param userId
	 * @param pointsToAdd
	 * @param actionDescription
	 * @param actionType
	 * @param metadata
	 * @param queryRunner
	 * @returns
	 */
	async addPointsFromAction(
		userId: number,
		pointsToAdd: number,
		actionDescription: string,
		actionType?: string,
		metadata?: string,
		queryRunner?: QueryRunner
	): Promise<Score> {
		this.logger.info("Adding points from action", {
			userId,
			pointsToAdd,
			actionDescription,
			actionType,
		});

		// Validate points
		if (pointsToAdd <= 0) {
			throw new ValidationError("Points to add must be positive");
		}

		if (pointsToAdd > 1000) {
			throw new ValidationError("Points to add cannot exceed 1000");
		}

		const updatedScore = await this.scoreRepository.addScore(
			userId,
			pointsToAdd,
			actionDescription,
			actionType,
			metadata,
			queryRunner
		);

		this.logger.info("Points added successfully from action", {
			userId,
			newScore: updatedScore.pointsEarned,
			pointsAdded: pointsToAdd,
			actionDescription,
		});

		return updatedScore;
	}

	async notificationScoreOfUserUpdated(userId: number): Promise<void> {
		this.logger.info("Notifying score of user updated by web socket", {
			userId,
		});
		const scoreboard = await this.getScoreboard();
		// Send scoreboard to all connected clients to update scoreboard
		this.logger.info("Sending scoreboard to all connected clients", {
			scoreboard,
		});
	}
}

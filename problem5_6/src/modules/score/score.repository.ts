import { Repository, DataSource } from "typeorm";
import { Score } from "../../common/database/entities/Score";
import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import { ScoreFilters } from "@/common/interfaces/score.interface";
import { QueryRunner } from "typeorm";
import { User } from "@/common/database/entities";

export interface IScoreRepository {
	create(data: Partial<Score>): Promise<Score>;
	findById(id: number): Promise<Score | null>;
	findByUserId(userId: number): Promise<Score | null>;
	findAll(filters?: ScoreFilters): Promise<{ scores: Score[]; total: number }>;
	update(id: number, data: Partial<Score>): Promise<Score | null>;
	getQueryRunner(): QueryRunner;
	getScoreboard(limit: number): Promise<User[]>;
	addScore(
		userId: number,
		pointsToAdd: number,
		actionDescription?: string,
		actionType?: string,
		metadata?: string,
		queryRunner?: QueryRunner
	): Promise<Score>;
}

export class ScoreRepository implements IScoreRepository {
	private repository: Repository<Score>;
	private dataSource: DataSource;

	constructor(database: Database, private logger: Logger) {
		this.dataSource = database.getDataSource();
		this.repository = this.dataSource.getRepository(Score);
	}

	/**
	 * Create a score
	 * @param data - The data to create the score with
	 * @returns The created score
	 */
	async create(data: Partial<Score>): Promise<Score> {
		this.logger.info("Creating new score record", { userId: data.userId });
		const score = this.repository.create(data);
		return await this.repository.save(score);
	}

	/**
	 * Get a score by ID
	 * @param id - The ID of the score to get
	 * @returns The score
	 */
	async findById(id: number): Promise<Score | null> {
		return await this.repository.findOne({
			where: { id },
			relations: ["user"],
		});
	}

	/**
	 * Get a score by user ID
	 * @param userId - The ID of the user to get the score of
	 * @returns The score
	 */
	async findByUserId(userId: number): Promise<Score | null> {
		return await this.repository.findOne({
			where: { userId },
			relations: ["user"],
		});
	}

	/**
	 * Get all scores
	 * @param filters - The filters to apply to the scores
	 * @returns The scores
	 */
	async findAll(
		filters?: ScoreFilters
	): Promise<{ scores: Score[]; total: number }> {
		const queryBuilder = this.repository.createQueryBuilder("score");

		queryBuilder.leftJoinAndSelect("score.user", "user");

		if (filters?.userId) {
			queryBuilder.andWhere("score.userId = :userId", {
				userId: filters.userId,
			});
		}

		if (filters?.actionType) {
			queryBuilder.andWhere("score.actionType = :actionType", {
				actionType: filters.actionType,
			});
		}

		if (filters?.minScore !== undefined) {
			queryBuilder.andWhere("score.score >= :minScore", {
				minScore: filters.minScore,
			});
		}

		if (filters?.maxScore !== undefined) {
			queryBuilder.andWhere("score.score <= :maxScore", {
				maxScore: filters.maxScore,
			});
		}

		if (filters?.startDate) {
			queryBuilder.andWhere("score.createdAt >= :startDate", {
				startDate: filters.startDate,
			});
		}

		if (filters?.endDate) {
			queryBuilder.andWhere("score.createdAt <= :endDate", {
				endDate: filters.endDate,
			});
		}

		queryBuilder.orderBy("score.score", "DESC");

		if (filters?.limit) {
			queryBuilder.limit(filters.limit);
		}

		if (filters?.offset) {
			queryBuilder.offset(filters.offset);
		}

		const [scores, total] = await queryBuilder.getManyAndCount();
		return { scores, total };
	}

	/**
	 * Update a score
	 * @param id - The ID of the score to update
	 * @param data - The data to update the score with
	 * @returns The updated score
	 */
	async update(id: number, data: Partial<Score>): Promise<Score | null> {
		this.logger.info("Updating score", { scoreId: id });
		await this.repository.update(id, data);
		return await this.findById(id);
	}

	/**
	 * Get the query runner
	 * @returns The query runner
	 */
	getQueryRunner(): QueryRunner {
		return this.dataSource.createQueryRunner();
	}

	/**
	 * Add a score
	 * @param userId - The ID of the user to add the score to
	 * @param pointsToAdd - The points to add to the score
	 * @param actionDescription - The description of the action
	 * @param actionType - The type of the action
	 * @param metadata - The metadata of the action
	 * @param queryRunner - The query runner to use for the transaction
	 * @returns The added score
	 */
	async addScore(
		userId: number,
		pointsToAdd: number,
		actionDescription?: string,
		actionType?: string,
		metadata?: string,
		queryRunner?: QueryRunner
	): Promise<Score> {
		const score = this.repository.create({
			userId,
			pointsEarned: pointsToAdd,
			actionDescription,
			actionType,
			metadata,
		});
		let savedScore: Score;
		if (queryRunner) {
			savedScore = await queryRunner.manager.save(score);
		} else {
			savedScore = await this.repository.save(score);
		}

		this.logger.info("Score update  completed successfully", {
			userId,
			newScore: savedScore.pointsEarned,
			pointsAdded: pointsToAdd,
		});

		return savedScore;
	}

	/**
	 * Get the scoreboard
	 * @param limit - The limit of the scoreboard
	 * @returns The scoreboard
	 */
	async getScoreboard(limit: number = 10): Promise<User[]> {
		const queryBuilder = this.dataSource.createQueryBuilder();
		const topUsers = await queryBuilder
			.select([
				"user.id as userId",
				"user.name as userName",
				"user.email as userEmail",
				"SUM(score.pointsEarned) as totalPoints",
				"MAX(score.updatedAt) as lastUpdated",
			])
			.from(Score, "score")
			.innerJoin(User, "user", "user.id = score.userId")
			.groupBy("user.id")
			.addGroupBy("user.name")
			.addGroupBy("user.email")
			.orderBy("totalPoints", "DESC")
			.limit(limit)
			.getRawMany();

		const users: User[] = [];
		for (const rawUser of topUsers) {
			const user = new User();
			user.id = rawUser.userId;
			user.name = rawUser.userName;
			user.email = rawUser.userEmail;
			user.totalPoints = parseInt(rawUser.totalPoints);
			user.lastUpdated = rawUser.lastUpdated;
			users.push(user);
		}

		return users;
	}

	/**
	 * Get the score history of a user
	 * @param userId - The ID of the user to get the score history of
	 * @param page - The page number
	 * @param pageSize - The page size
	 * @returns The score history
	 */
	async getScoreHistory(
		userId: number,
		page: number = 1,
		pageSize: number = 20
	): Promise<{ scores: Score[]; total: number }> {
		const offset = (page - 1) * pageSize;

		const queryBuilder = this.repository.createQueryBuilder("score");
		queryBuilder
			.where("score.userId = :userId", { userId })
			.orderBy("score.createdAt", "DESC")
			.skip(offset)
			.take(pageSize);

		const [scores, total] = await queryBuilder.getManyAndCount();
		return { scores, total };
	}
}

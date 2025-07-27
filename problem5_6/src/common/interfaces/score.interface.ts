export interface CreateScoreRequest {
	userId: number;
	pointsToAdd: number;
	actionDescription?: string;
	actionType?: string;
	metadata?: string;
}

export interface UpdateScoreRequest {
	pointsToAdd: number;
	actionDescription?: string;
	actionType?: string;
	metadata?: string;
}

export interface ScoreFilters {
	userId?: number;
	actionType?: string;
	minScore?: number;
	maxScore?: number;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
}

export interface ScoreboardEntry {
	rank: number;
	userId: number;
	userName: string;
	userEmail: string;
	totalScore: number;
	lastUpdated: Date;
}

export interface ScoreboardResponse {
	entries: ScoreboardEntry[];
	total: number;
	lastUpdated: Date;
}

export interface ScoreHistoryEntry {
	id: number;
	userId: number;
	score: number;
	pointsEarned: number;
	actionDescription?: string;
	actionType?: string;
	createdAt: Date;
}

export interface ScoreHistoryResponse {
	entries: ScoreHistoryEntry[];
	total: number;
	page: number;
	pageSize: number;
}

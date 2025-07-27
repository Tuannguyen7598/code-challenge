export class ValidationHelper {
	/**
	 * Validate an email
	 * @param email - The email to validate
	 * @returns void
	 */
	static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Validate an age
	 * @param age - The age to validate
	 * @returns void
	 */
	static isValidAge(age: number): boolean {
		return age >= 0 && age <= 150;
	}

	/**
	 * Validate a UUID
	 * @param id - The ID to validate
	 * @returns void
	 */
	static isValidUUID(id: string): boolean {
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(id);
	}

	/**
	 * Sanitize a string
	 * @param str - The string to sanitize
	 * @returns The sanitized string
	 */
	static sanitizeString(str: string): string {
		return str.trim().replace(/\s+/g, " ");
	}

	/**
	 * Validate pagination parameters
	 * @param limit - The limit of the pagination
	 * @param offset - The offset of the pagination
	 * @returns The validated pagination parameters
	 */
	static validatePaginationParams(
		limit?: number,
		offset?: number
	): { limit: number; offset: number } {
		const defaultLimit = 10;
		const maxLimit = 100;

		return {
			limit: limit && limit > 0 && limit <= maxLimit ? limit : defaultLimit,
			offset: offset && offset >= 0 ? offset : 0,
		};
	}

	/**
	 * Validate a user ID
	 * @param userId - The ID of the user to validate
	 * @returns void
	 */
	static isValidUserId(userId: number): boolean {
		return userId > 0 && Number.isInteger(userId);
	}

	/**
	 * Validate a score
	 * @param score - The score to validate
	 * @returns void
	 */
	static isValidScore(score: number): boolean {
		return score >= 0 && Number.isInteger(score) && score <= 1000000;
	}

	/**
	 * Validate a score ID
	 * @param scoreId - The ID of the score to validate
	 * @returns void
	 */
	static isValidScoreId(scoreId: number): boolean {
		return scoreId > 0 && Number.isInteger(scoreId);
	}
}

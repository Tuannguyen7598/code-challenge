export class ValidationHelper {
	static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	static isValidAge(age: number): boolean {
		return age >= 0 && age <= 150;
	}

	static isValidUUID(id: string): boolean {
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(id);
	}

	static sanitizeString(str: string): string {
		return str.trim().replace(/\s+/g, " ");
	}

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
}

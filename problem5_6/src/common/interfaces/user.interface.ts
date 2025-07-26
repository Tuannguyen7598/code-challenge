export interface CreateUserRequest {
	name: string;
	email: string;
	age: number;
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	age?: number;
}

export interface UserFilters {
	name?: string;
	email?: string;
	minAge?: number;
	maxAge?: number;
	limit?: number;
	offset?: number;
}

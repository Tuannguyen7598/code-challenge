export interface CreateAuthUserRequest {
	username: string;
	email: string;
	password: string;
	role?: "admin" | "user";
	userId: number;
}

export interface UpdateAuthUserRequest {
	username?: string;
	email?: string;
	password?: string;
	role?: "admin" | "user";
	isActive?: boolean;
}

export interface AuthUser {
	id: string;
	username: string;
	email: string;
	password: string;
	role: "admin" | "user";
	isActive: boolean;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthUserPublic {
	id: number;
	username: string;
	email: string;
	role: "admin" | "user";
	isActive: boolean;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	user: AuthUserPublic;
	token: string;
}

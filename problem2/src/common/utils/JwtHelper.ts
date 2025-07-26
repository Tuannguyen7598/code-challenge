import { AppConfig } from "@/Config";
import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
	userId: number;
	email: string;
	role: string;
	iat?: number;
	exp?: number;
}

export class JwtHelper {
	private static readonly SECRET_KEY = AppConfig.jwt.secret;
	private static readonly EXPIRES_IN = AppConfig.jwt.expiresIn;

	static generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
		return jwt.sign(payload, this.SECRET_KEY, {
			expiresIn: this.EXPIRES_IN,
		} as any);
	}

	static verifyToken(token: string): JwtPayload {
		try {
			const decoded = jwt.verify(token, this.SECRET_KEY) as JwtPayload;
			return decoded;
		} catch (error) {
			throw new Error("Invalid or expired token");
		}
	}

	static decodeToken(token: string): JwtPayload | null {
		try {
			const decoded = jwt.decode(token) as JwtPayload;
			return decoded;
		} catch (error) {
			return null;
		}
	}

	static isTokenExpired(token: string): boolean {
		try {
			const decoded = jwt.decode(token) as JwtPayload;
			if (!decoded || !decoded.exp) {
				return true;
			}
			return Date.now() >= decoded.exp * 1000;
		} catch (error) {
			return true;
		}
	}
}

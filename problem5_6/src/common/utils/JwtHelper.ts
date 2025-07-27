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

	/**
	 * Generate a JWT token
	 * @param payload - The payload to generate the token with
	 * @returns The generated token
	 */
	static generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
		return jwt.sign(payload, this.SECRET_KEY, {
			expiresIn: this.EXPIRES_IN,
		} as any);
	}

	/**
	 * Verify a JWT token
	 * @param token - The token to verify
	 * @returns The decoded payload
	 */
	static verifyToken(token: string): JwtPayload {
		try {
			const decoded = jwt.verify(token, this.SECRET_KEY) as JwtPayload;
			return decoded;
		} catch (error) {
			throw new Error("Invalid or expired token");
		}
	}

	/**
	 * Decode a JWT token
	 * @param token - The token to decode
	 * @returns The decoded payload
	 */
	static decodeToken(token: string): JwtPayload | null {
		try {
			const decoded = jwt.decode(token) as JwtPayload;
			return decoded;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Check if a JWT token is expired
	 * @param token - The token to check
	 * @returns void
	 */
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

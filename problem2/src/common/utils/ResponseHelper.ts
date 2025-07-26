import { Response } from "express";

export class ResponseHelper {
	static success(
		res: Response,
		data?: any,
		message?: string,
		statusCode: number = 200
	): void {
		res.status(statusCode).json({
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
		});
	}

	static error(
		res: Response,
		message: string,
		statusCode: number = 500,
		errors?: any
	): void {
		res.status(statusCode).json({
			success: false,
			message,
			errors,
			timestamp: new Date().toISOString(),
		});
	}

	static created(res: Response, data: any, message?: string): void {
		this.success(res, data, message, 201);
	}

	static notFound(res: Response, message: string = "Resource not found"): void {
		this.error(res, message, 404);
	}

	static badRequest(res: Response, message: string, errors?: any): void {
		this.error(res, message, 400, errors);
	}

	static unauthorized(res: Response, message: string = "Unauthorized"): void {
		this.error(res, message, 401);
	}

	static forbidden(res: Response, message: string = "Forbidden"): void {
		this.error(res, message, 403);
	}

	static conflict(res: Response, message: string = "Conflict"): void {
		this.error(res, message, 409);
	}

	static paginated<T>(
		res: any,
		data: T[],
		total: number,
		page: number,
		page_size: number,
		message = "Success"
	) {
		return res.status(200).json({
			data,
			total,
			page,
			page_size,
			message,
		});
	}
}

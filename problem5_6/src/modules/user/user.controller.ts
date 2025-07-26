import { Router, Request, Response } from "express";
import { UserService } from "./user.service";
import {
	CreateUserRequest,
	UpdateUserRequest,
	UserFilters,
} from "@/common/interfaces/user.interface";
import { Logger } from "@/common/logger/Logger";
import { ResponseHelper } from "@/common/utils/ResponseHelper";

export class UserController {
	constructor(private userService: UserService, private logger: Logger) {}

	async createUser(req: Request, res: Response): Promise<void> {
		const userData: CreateUserRequest = req.body;
		const user = await this.userService.createUser(userData);

		this.logger.info("User created successfully", { userId: user.id });
		ResponseHelper.created(res, user, "User created successfully");
	}

	async getAllUsers(req: Request, res: Response): Promise<void> {
		const filters: UserFilters & { page?: number; page_size?: number } = {};

		if (req.query["name"]) filters.name = req.query["name"] as string;
		if (req.query["email"]) filters.email = req.query["email"] as string;
		if (req.query["minAge"])
			filters.minAge = parseInt(req.query["minAge"] as string);
		if (req.query["maxAge"])
			filters.maxAge = parseInt(req.query["maxAge"] as string);
		if (req.query["limit"])
			filters.limit = parseInt(req.query["limit"] as string);
		if (req.query["offset"])
			filters.offset = parseInt(req.query["offset"] as string);
		if (req.query["page"]) filters.page = parseInt(req.query["page"] as string);
		if (req.query["page_size"])
			filters.page_size = parseInt(req.query["page_size"] as string);

		const { users, total, page, page_size } =
			await this.userService.getAllUsers(filters);
		ResponseHelper.success(
			res,
			{ data: users, total, page, page_size },
			"Users retrieved successfully"
		);
	}

	async getUserById(req: Request, res: Response): Promise<void> {
		const id = req.params["id"] as string;
		const user = await this.userService.getUserById(id);

		ResponseHelper.success(res, user, "User retrieved successfully");
	}

	async updateUser(req: Request, res: Response): Promise<void> {
		const id = req.params["id"] as string;
		const userData: UpdateUserRequest = req.body;
		const user = await this.userService.updateUser(id, userData);

		this.logger.info("User updated successfully", { userId: id });
		ResponseHelper.success(res, user, "User updated successfully");
	}

	async deleteUser(req: Request, res: Response): Promise<void> {
		const id = req.params["id"] as string;
		await this.userService.deleteUser(id);

		this.logger.info("User deleted successfully", { userId: id });
		ResponseHelper.success(res, null, "User deleted successfully");
	}
}

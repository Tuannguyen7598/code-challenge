import { Logger } from "../logger/Logger";
import { AppDataSource } from "./DataSource";

export class Database {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	async connect(): Promise<void> {
		try {
			await AppDataSource.initialize();
			this.logger.info("Database connected successfully", {
				database: AppDataSource.options.database,
				entities: AppDataSource.entityMetadatas.map((meta) => meta.name),
			});
		} catch (error) {
			this.logger.error("Failed to connect to database", { error });
			throw error;
		}
	}

	getDataSource() {
		return AppDataSource;
	}

	async close(): Promise<void> {
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
			this.logger.info("Database connection closed");
		}
	}

	isConnected(): boolean {
		return AppDataSource.isInitialized;
	}

	// Method để kiểm tra trạng thái database
	async healthCheck(): Promise<{ status: string; details: any }> {
		try {
			if (!this.isConnected()) {
				return { status: "disconnected", details: null };
			}

			// Thực hiện query đơn giản để kiểm tra kết nối
			await AppDataSource.query("SELECT 1");

			return {
				status: "healthy",
				details: {
					database: AppDataSource.options.database,
					entities: AppDataSource.entityMetadatas.length,
					driver: AppDataSource.driver.options.type,
				},
			};
		} catch (error) {
			return {
				status: "unhealthy",
				details: {
					error: error instanceof Error ? error.message : String(error),
				},
			};
		}
	}
}

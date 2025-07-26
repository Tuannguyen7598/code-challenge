import { DataSource } from "typeorm";
import { User, AuthUser } from "./entities";
import { AppConfig } from "../../Config";

export const AppDataSource = new DataSource({
	type: "sqlite",
	database: AppConfig.db.path,
	synchronize: false, // We'll use migrations
	logging: AppConfig.env === "development",
	entities: [User, AuthUser],
	migrations: ["src/common/database/migrations/*.ts"],
	subscribers: [],
});

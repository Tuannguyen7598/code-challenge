import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const AppConfig = {
	env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 3000,
	db: {
		path: process.env.DB_PATH || "./database.sqlite",
	},
	jwt: {
		secret: process.env.JWT_SECRET || "your-secret-key",
		expiresIn: process.env.JWT_EXPIRES_IN || "24h",
	},
	cors: {
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
	},
	logger: {
		level: process.env.LOG_LEVEL || "info",
		file: process.env.LOG_FILE || path.join(__dirname, "../../../logs/app.log"),
	},
};

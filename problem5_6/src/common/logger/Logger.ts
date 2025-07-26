import winston from "winston";
import path from "path";
import { AppConfig } from "@/Config";

export class Logger {
	private logger: winston.Logger;

	constructor() {
		this.logger = winston.createLogger({
			level: AppConfig.logger.level,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.json()
			),
			defaultMeta: { service: "crud-server" },
			transports: [
				new winston.transports.File({
					filename: AppConfig.logger.file,
					maxsize: 5242880, // 5MB
					maxFiles: 5,
				}),
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple()
					),
				}),
			],
		});
	}

	info(message: string, meta?: any): void {
		this.logger.info(message, meta);
	}

	error(message: string, meta?: any): void {
		this.logger.error(message, meta);
	}

	warn(message: string, meta?: any): void {
		this.logger.warn(message, meta);
	}

	debug(message: string, meta?: any): void {
		this.logger.debug(message, meta);
	}
}

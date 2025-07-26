import { Database } from "@/common/database/Database";
import { Logger } from "@/common/logger/Logger";
import { AppConfig } from "@/Config";

export interface HealthStatus {
	status: "healthy" | "unhealthy" | "degraded";
	timestamp: string;
	uptime: number;
	version: string;
	environment: string;
	services: {
		database: {
			status: "healthy" | "unhealthy";
			details?: any;
		};
		memory: {
			status: "healthy" | "unhealthy";
			details: {
				used: number;
				total: number;
				percentage: number;
			};
		};
		disk: {
			status: "healthy" | "unhealthy";
			details?: any;
		};
	};
	checks: {
		[key: string]: {
			status: "healthy" | "unhealthy";
			message?: string;
			timestamp: string;
		};
	};
}

export class HealthService {
	constructor(private database: Database, private logger: Logger) {}

	async getHealthStatus(): Promise<HealthStatus> {
		const startTime = Date.now();
		const checks: HealthStatus["checks"] = {};

		try {
			// Database health check
			const dbHealth = await this.checkDatabase();
			checks.database = {
				status: dbHealth.status,
				message:
					dbHealth.status === "healthy"
						? "Database is connected"
						: "Database connection failed",
				timestamp: new Date().toISOString(),
			};

			// Memory health check
			const memoryHealth = this.checkMemory();
			checks.memory = {
				status: memoryHealth.status,
				message:
					memoryHealth.status === "healthy"
						? "Memory usage is normal"
						: "High memory usage detected",
				timestamp: new Date().toISOString(),
			};

			// Disk health check (if applicable)
			const diskHealth = this.checkDisk();
			checks.disk = {
				status: diskHealth.status,
				message:
					diskHealth.status === "healthy"
						? "Disk space is sufficient"
						: "Low disk space",
				timestamp: new Date().toISOString(),
			};

			// Determine overall status
			const allChecks = Object.values(checks);
			const unhealthyCount = allChecks.filter(
				(check) => check.status === "unhealthy"
			).length;
			const degradedCount = allChecks.filter(
				(check) => (check.status as any) === "degraded"
			).length;

			let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";
			if (unhealthyCount > 0) {
				overallStatus = "unhealthy";
			} else if (degradedCount > 0) {
				overallStatus = "degraded";
			}

			const healthStatus: HealthStatus = {
				status: overallStatus,
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				version: process.env.npm_package_version || "1.0.0",
				environment: AppConfig.env,
				services: {
					database: {
						status: dbHealth.status,
						details: dbHealth.details,
					},
					memory: {
						status: memoryHealth.status,
						details: memoryHealth.details,
					},
					disk: {
						status: diskHealth.status,
						details: diskHealth.details,
					},
				},
				checks,
			};

			const duration = Date.now() - startTime;
			this.logger.info("Health check completed", {
				status: overallStatus,
				duration,
				checks: Object.keys(checks).length,
			});

			return healthStatus;
		} catch (error) {
			this.logger.error("Health check failed", { error });

			return {
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				version: process.env.npm_package_version || "1.0.0",
				environment: AppConfig.env,
				services: {
					database: { status: "unhealthy" },
					memory: {
						status: "unhealthy",
						details: { used: 0, total: 0, percentage: 0 },
					},
					disk: { status: "unhealthy" },
				},
				checks: {
					health_check: {
						status: "unhealthy",
						message: "Health check failed",
						timestamp: new Date().toISOString(),
					},
				},
			};
		}
	}

	private async checkDatabase(): Promise<{
		status: "healthy" | "unhealthy";
		details?: any;
	}> {
		try {
			const dbHealth = await this.database.healthCheck();
			return {
				status: dbHealth.status === "healthy" ? "healthy" : "unhealthy",
				details: dbHealth.details,
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

	private checkMemory(): {
		status: "healthy" | "unhealthy";
		details: { used: number; total: number; percentage: number };
	} {
		const memUsage = process.memoryUsage();
		const used = memUsage.heapUsed;
		const total = memUsage.heapTotal;
		const percentage = (used / total) * 100;

		// Consider unhealthy if memory usage is above 90%
		const status: "healthy" | "unhealthy" =
			percentage > 90 ? "unhealthy" : "healthy";

		return {
			status,
			details: {
				used: Math.round(used / 1024 / 1024), // MB
				total: Math.round(total / 1024 / 1024), // MB
				percentage: Math.round(percentage * 100) / 100,
			},
		};
	}

	private checkDisk(): { status: "healthy" | "unhealthy"; details?: any } {
		// For SQLite, we'll check if the database file exists and is writable
		// In a production environment, you might want to check actual disk space
		try {
			const fs = require("fs");
			const dbPath = AppConfig.db.path;

			// Check if database file exists and is accessible
			if (fs.existsSync(dbPath)) {
				// Try to write a test file to check write permissions
				const testPath = `${dbPath}.test`;
				fs.writeFileSync(testPath, "test");
				fs.unlinkSync(testPath);

				return {
					status: "healthy" as const,
					details: { path: dbPath, accessible: true },
				};
			} else {
				return {
					status: "unhealthy" as const,
					details: {
						path: dbPath,
						accessible: false,
						reason: "Database file not found",
					},
				};
			}
		} catch (error) {
			return {
				status: "unhealthy" as const,
				details: {
					error: error instanceof Error ? error.message : String(error),
				},
			};
		}
	}

	// Simple health check for load balancers
	async getSimpleHealth(): Promise<{
		status: "ok" | "error";
		timestamp: string;
	}> {
		try {
			const dbHealth = await this.database.healthCheck();
			return {
				status: dbHealth.status === "healthy" ? "ok" : "error",
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: "error",
				timestamp: new Date().toISOString(),
			};
		}
	}
}

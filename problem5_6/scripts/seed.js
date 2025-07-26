const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const dotenv = require("dotenv");
const readline = require("readline");

dotenv.config();

// Tạo interface để đọc input từ terminal
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// Function để hỏi user input
function askQuestion(question) {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
}

// Function để validate input
function validateInput(input, type) {
	if (!input || input.length === 0) {
		return false;
	}

	switch (type) {
		case "username":
			// Username phải có ít nhất 3 ký tự, chỉ chứa chữ cái, số, dấu gạch dưới
			return /^[a-zA-Z0-9_]{3,50}$/.test(input);
		case "password":
			// Password phải có ít nhất 6 ký tự
			return input.length >= 6;
		case "email":
			// Email format cơ bản
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
		default:
			return true;
	}
}

// Function để tạo admin user với input từ terminal
async function createAdminUser(db) {
	console.log("\n🔧 Tạo Admin User");
	console.log("==================");

	let username, email, password;

	// Nhập username
	while (true) {
		username = await askQuestion(
			"Nhập username cho admin (3-50 ký tự, chỉ chữ cái, số, dấu gạch dưới): "
		);
		if (validateInput(username, "username")) {
			break;
		}
		console.log("❌ Username không hợp lệ. Vui lòng thử lại.");
	}

	// Nhập email
	while (true) {
		email = await askQuestion("Nhập email cho admin: ");
		if (validateInput(email, "email")) {
			break;
		}
		console.log("❌ Email không hợp lệ. Vui lòng thử lại.");
	}

	// Nhập password
	while (true) {
		password = await askQuestion("Nhập password cho admin (ít nhất 6 ký tự): ");
		if (validateInput(password, "password")) {
			break;
		}
		console.log("❌ Password không hợp lệ. Vui lòng thử lại.");
	}

	// Xác nhận password
	while (true) {
		const confirmPassword = await askQuestion("Xác nhận password: ");
		if (password === confirmPassword) {
			break;
		}
		console.log("❌ Password không khớp. Vui lòng thử lại.");
	}

	// Kiểm tra xem username hoặc email đã tồn tại chưa
	const existingUser = await new Promise((resolve, reject) => {
		db.get(
			"SELECT * FROM auth_users WHERE username = ? OR email = ?",
			[username, email],
			(err, row) => {
				if (err) reject(err);
				else resolve(row);
			}
		);
	});

	if (existingUser) {
		console.log("❌ Username hoặc email đã tồn tại!");
		return null;
	}

	// Tạo admin user trong bảng users
	const userResult = await new Promise((resolve, reject) => {
		db.run(
			"INSERT INTO users (name, email, age, status) VALUES (?, ?, ?, ?)",
			[username, email, 30, "active"],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});

	// Tạo auth user cho admin
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	await new Promise((resolve, reject) => {
		db.run(
			"INSERT INTO auth_users (username, email, password, role, isActive, userId) VALUES (?, ?, ?, ?, ?, ?)",
			[username, email, hashedPassword, "admin", 1, userResult],
			function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			}
		);
	});

	return { username, email, password };
}

async function seedDatabase() {
	const dbPath =
		process.env.DB_PATH || path.join(__dirname, "../database.sqlite");

	// Tạo kết nối database
	const db = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			console.error("❌ Error connecting to database:", err.message);
			process.exit(1);
		}
		console.log("✅ Connected to SQLite database");
	});

	try {
		console.log("🌱 Starting database seeding...");

		// Bắt đầu transaction
		await new Promise((resolve, reject) => {
			db.run("BEGIN TRANSACTION", (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		// Kiểm tra xem có admin user nào chưa
		const existingAdmin = await new Promise((resolve, reject) => {
			db.get(
				"SELECT * FROM auth_users WHERE role = 'admin' LIMIT 1",
				(err, row) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});

		if (existingAdmin) {
			console.log("⚠️  Admin user already exists!");
			console.log(`   Username: ${existingAdmin.username}`);
			console.log(`   Email: ${existingAdmin.email}`);

			const createNew = await askQuestion(
				"\nBạn có muốn tạo thêm admin user khác không? (y/n): "
			);
			if (
				createNew.toLowerCase() !== "y" &&
				createNew.toLowerCase() !== "yes"
			) {
				console.log("Skipping admin creation...");
			} else {
				const adminData = await createAdminUser(db);
				if (adminData) {
					console.log("✅ Admin user created successfully!");
					console.log("📋 Admin credentials:");
					console.log(`   Username: ${adminData.username}`);
					console.log(`   Email: ${adminData.email}`);
					console.log(`   Password: ${adminData.password}`);
					console.log(`   Role: admin`);
				}
			}
		} else {
			console.log("📝 No admin user found. Creating admin user...");
			const adminData = await createAdminUser(db);
			if (adminData) {
				console.log("✅ Admin user created successfully!");
				console.log("📋 Admin credentials:");
				console.log(`   Username: ${adminData.username}`);
				console.log(`   Email: ${adminData.email}`);
				console.log(`   Password: ${adminData.password}`);
				console.log(`   Role: admin`);
			}
		}

		// Hỏi có muốn tạo sample users không
		const createSampleUsers = await askQuestion(
			"\nBạn có muốn tạo sample users không? (y/n): "
		);

		if (
			createSampleUsers.toLowerCase() === "y" ||
			createSampleUsers.toLowerCase() === "yes"
		) {
			console.log("📝 Creating sample users...");

			const sampleUsers = [
				{
					name: "John Doe",
					email: "john@example.com",
					age: 25,
					username: "johndoe",
					password: "password123",
				},
				{
					name: "Jane Smith",
					email: "jane@example.com",
					age: 28,
					username: "janesmith",
					password: "password123",
				},
				{
					name: "Bob Johnson",
					email: "bob@example.com",
					age: 35,
					username: "bobjohnson",
					password: "password123",
				},
			];

			for (const userData of sampleUsers) {
				// Kiểm tra xem user đã tồn tại chưa
				const existingUser = await new Promise((resolve, reject) => {
					db.get(
						"SELECT * FROM users WHERE email = ?",
						[userData.email],
						(err, row) => {
							if (err) reject(err);
							else resolve(row);
						}
					);
				});

				if (existingUser) {
					console.log(`⚠️  User ${userData.email} already exists, skipping...`);
					continue;
				}

				// Thêm vào bảng users (id tự động tạo)
				const userResult = await new Promise((resolve, reject) => {
					db.run(
						"INSERT INTO users (name, email, age, status) VALUES (?, ?, ?, ?)",
						[userData.name, userData.email, userData.age, "active"],
						function (err) {
							if (err) reject(err);
							else resolve(this.lastID);
						}
					);
				});

				// Thêm vào bảng auth_users
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
				await new Promise((resolve, reject) => {
					db.run(
						"INSERT INTO auth_users (username, email, password, role, isActive, userId) VALUES (?, ?, ?, ?, ?, ?)",
						[
							userData.username,
							userData.email,
							hashedPassword,
							"user",
							1,
							userResult,
						],
						function (err) {
							if (err) reject(err);
							else resolve(this.lastID);
						}
					);
				});

				console.log(`✅ Created user: ${userData.email}`);
			}
		} else {
			console.log("Skipping sample users creation...");
		}

		// Commit transaction
		await new Promise((resolve, reject) => {
			db.run("COMMIT", (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		console.log("\n🎉 Database seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);

		// Rollback transaction nếu có lỗi
		try {
			await new Promise((resolve, reject) => {
				db.run("ROLLBACK", (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
			console.log("🔄 Transaction rolled back due to error");
		} catch (rollbackError) {
			console.error("❌ Error rolling back transaction:", rollbackError);
		}

		process.exit(1);
	} finally {
		// Đóng readline interface
		rl.close();

		// Đóng kết nối database
		db.close((err) => {
			if (err) {
				console.error("❌ Error closing database:", err.message);
			} else {
				console.log("✅ Database connection closed");
			}
		});
	}
}

// Chạy hàm seed
seedDatabase();

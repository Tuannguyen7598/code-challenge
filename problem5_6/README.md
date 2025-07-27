# CRUD Server với ExpressJS và TypeScript

Backend server được xây dựng với ExpressJS và TypeScript, áp dụng Clean Architecture pattern.

## Tính năng

- ✅ CRUD operations cho User entity
- ✅ Clean Architecture pattern
- ✅ TypeScript support
- ✅ SQLite database
- ✅ Winston logging
- ✅ Input validation với express-validator
- ✅ Error handling middleware
- ✅ Security middleware (helmet, cors)
- ✅ Environment configuration
- ✅ Graceful shutdown
- ✅ **JWT Authentication & Authorization**
- ✅ **Password hashing với bcrypt**
- ✅ **Role-based access control (Admin/User)**
- ✅ **Protected routes với middleware**
- ✅ **Exception Filter - Centralized error handling**

## Cấu trúc dự án

```
src/
├── common/                 # Common utilities và shared components
│   ├── database/          # Database connection & TypeORM
│   │   ├── Database.ts          # TypeORM DataSource manager
│   │   └── entities/            # TypeORM entities
|   |   |── migrations/          # TypeORM migrations
│   ├── exceptions/        # Custom error classes
│   │   └── index.ts            # Error classes export
│   ├── logger/            # Logging utilities
│   ├── health/            # Health check service
│   ├── interfaces/            # Interface
│   ├── middleware/        # Common middleware
│   │   ├── AuthMiddleware.ts    # JWT authentication middleware
│   │   ├── ExceptionFilter.ts   # Centralized exception handling
│   │   └── ErrorHandler.ts      # Error handling middleware
│   └── utils/             # Utility functions
│       ├── JwtHelper.ts         # JWT encryption/decryption
│       ├── ResponseHelper.ts    # Response formatting
│       └── ValidationHelper.ts  # Input validation
├── modules/               # Feature modules (NestJS style)
│   ├── user/              # User module
│   │   ├── user.entity.ts
│   │   ├── user.repository.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   ├── user.routes.ts
│   │   └── user.module.ts
│   └── auth/              # Auth module
│       ├── auth.entity.ts
│       ├── auth.repository.ts   # Database operations cho auth
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       ├── auth.routes.ts
│       └── auth.module.ts
├── App.ts                 # Main application class
└── index.ts               # Entry point
```

## Yêu cầu hệ thống

- Node.js >= 22.15.0
- npm hoặc yarn

## Cài đặt

1. Clone repository và di chuyển vào thư mục dự án:

```bash
cd problem5_6
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env từ template:

```bash
cp env.example .env
```

4. Cấu hình tuỳ chỉnh biến môi trường trong file .env:

5. Tạo forder lưu volume db:

```bash
mkdir db_volume
```

6. Chạy migrations để tạo database:

```bash
npm run migrate:run
```

7. Import seed data (admin user + sample users):

```bash
npm run seed
```

**Lưu ý**: Nếu gặp lỗi "Cannot find module", hãy đảm bảo:

- Đã chạy `npm run migrate:run` trước
- Database file đã được tạo thành công
- Tất cả dependencies đã được cài đặt đúng

## Chạy ứng dụng

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

## Authentication & Authorization

### JWT Authentication

Hệ thống sử dụng JWT (JSON Web Tokens) cho authentication:

- **Token Generation**: Tự động tạo JWT token khi đăng ký/đăng nhập
- **Token Validation**: Middleware tự động validate token cho protected routes
- **Token Expiration**: Token có thời hạn (mặc định 24h)
- **Password Security**: Password được hash bằng bcrypt với salt rounds = 10

### Role-based Authorization

Hệ thống hỗ trợ 2 roles:

- **`user`**: Quyền truy cập cơ bản
- **`admin`**: Quyền truy cập đầy đủ (bao gồm xóa user)

### Middleware

#### AuthMiddleware

```typescript
// Authenticate user (required cho protected routes)
authMiddleware.authenticate;

// Authorize by roles
authMiddleware.authorize(["admin", "user"]);

// Optional authentication (không bắt buộc)
authMiddleware.optionalAuth;
```

#### Protected Routes

- **User Routes**: Tất cả routes đều yêu cầu authentication
- **Delete User**: Yêu cầu role `admin`
- **Auth Routes**: Register/Login không cần authentication, Logout/Me yêu cầu authentication

## API Endpoints

### Health Check

- `GET /health/liveness` - Liveness probe (Kubernetes liveness check)
- `GET /health/readiness` - Readiness probe (Kubernetes readiness check)
- `GET /health` - Legacy health check (backward compatibility)

**Response:**

```json
{
	"success": true,
	"message": "Server is running",
	"timestamp": "2025-07-26T13:59:54.273Z"
}
```

### Authentication API

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất (yêu cầu authentication)
- `GET /api/auth/me` - Lấy thông tin user hiện tại (yêu cầu authentication)

### Users API (Tất cả đều yêu cầu authentication)

- `POST /api/users` - Tạo user mới
- `GET /api/users` - Lấy danh sách users (có filter)
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (yêu cầu role admin)

**Response Examples:**

#### Create User Response:

```json
{
	"success": true,
	"data": {
		"name": "Nguyễn Văn A",
		"email": "nguyenvana@example.com",
		"age": 25,
		"id": 13,
		"createdAt": "2025-07-26T13:59:54.000Z",
		"updatedAt": "2025-07-26T13:59:54.000Z",
		"deletedAt": null,
		"status": "active"
	},
	"message": "User created successfully",
	"timestamp": "2025-07-26T13:59:54.745Z"
}
```

#### Get Users Response:

```json
{
	"success": true,
	"data": {
		"data": [
			{
				"id": 13,
				"createdAt": "2025-07-26T13:59:54.000Z",
				"updatedAt": "2025-07-26T13:59:54.000Z",
				"deletedAt": null,
				"name": "Nguyễn Văn A",
				"email": "nguyenvana@example.com",
				"age": 25,
				"status": "active"
			}
		],
		"total": 11,
		"page": 1,
		"page_size": 10
	},
	"message": "Users retrieved successfully",
	"timestamp": "2025-07-26T13:59:54.808Z"
}
```

#### Update User Response:

```json
{
	"success": true,
	"data": {
		"id": 13,
		"createdAt": "2025-07-26T13:59:54.000Z",
		"updatedAt": "2025-07-26T13:59:54.000Z",
		"deletedAt": null,
		"name": "Nguyễn Văn B",
		"email": "nguyenvana@example.com",
		"age": 26,
		"status": "active"
	},
	"message": "User updated successfully",
	"timestamp": "2025-07-26T13:59:54.940Z"
}
```

#### Delete User Response:

```json
{
	"success": true,
	"data": null,
	"message": "User deleted successfully",
	"timestamp": "2025-07-26T13:59:55.216Z"
}
```

### Query Parameters cho GET /api/users

- `name` - Tìm kiếm theo tên (partial match)
- `email` - Tìm kiếm theo email (partial match)
- `minAge` - Tuổi tối thiểu
- `maxAge` - Tuổi tối đa
- `limit` - Số lượng kết quả trả về (1-100)
- `offset` - Số lượng bỏ qua

## Ví dụ sử dụng API

### Đăng ký tài khoản

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
	"success": true,
	"data": {
		"user": {
			"id": 6,
			"username": "johndoe",
			"email": "john@example.com",
			"role": "user",
			"isActive": 1,
			"userId": 10,
			"createdAt": "2025-07-26T13:57:57.000Z",
			"updatedAt": "2025-07-26T13:57:57.000Z"
		},
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	},
	"message": "User registered successfully",
	"timestamp": "2025-07-26T13:57:57.657Z"
}
```

### Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "password": "123456"
  }'
```

### Sử dụng API với JWT Token

```bash
# Lấy token từ response đăng nhập
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Tạo user mới (yêu cầu authentication)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "age": 25
  }'

# Lấy danh sách users
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users

# Lấy thông tin user hiện tại
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# Cập nhật user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Nguyễn Văn B",
    "age": 26
  }'

# Xóa user (chỉ admin)
curl -X DELETE http://localhost:3000/api/users/15 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Đăng xuất
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Lấy users với filter

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/users?minAge=20&maxAge=30&limit=10"
```

### Cập nhật user

```bash
curl -X PUT http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Nguyễn Văn B",
    "age": 26
  }'
```

### Xóa user (chỉ admin)

```bash
curl -X DELETE http://localhost:3000/api/users/{user-id} \
  -H "Authorization: Bearer $TOKEN"
```

## JWT Token Structure

### Payload

```json
{
	"userId": "auth-user-uuid",
	"email": "user@example.com",
	"role": "user",
	"iat": 1704067200,
	"exp": 1704153600
}
```

### Headers

```
Authorization: Bearer <token>
```

## Error Handling & Exception Filter

### Exception Filter Architecture

Hệ thống sử dụng **Exception Filter** để xử lý lỗi tập trung thay vì try-catch trong từng controller:

- **Centralized Error Handling**: Tất cả exceptions được xử lý tại một nơi
- **Automatic Logging**: Tự động log chi tiết với context đầy đủ
- **Type-safe Error Classes**: Custom error classes với type checking
- **Consistent Response Format**: Response format đồng nhất cho tất cả errors

### Custom Error Classes

```typescript
// Validation errors (400)
throw new ValidationError("Invalid email format");

// Authentication errors (401)
throw new AuthenticationError("Invalid credentials");

// Authorization errors (403)
throw new AuthorizationError("Insufficient permissions");

// Not found errors (404)
throw new NotFoundError("User not found");

// Conflict errors (409)
throw new ConflictError("User already exists");
```

### Error Response Examples

#### Authentication Errors (401)

```json
{
	"success": false,
	"message": "Authorization header is required",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

```json
{
	"success": false,
	"message": "Invalid or expired token",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Authorization Errors (403)

```json
{
	"success": false,
	"message": "Insufficient permissions",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Validation Errors (400)

```json
{
	"success": false,
	"message": "Invalid email format",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Not Found Errors (404)

```json
{
	"success": false,
	"message": "User not found",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Conflict Errors (409)

```json
{
	"success": false,
	"message": "User with this email already exists",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Internal Server Error (500)

```json
{
	"success": false,
	"message": "Internal server error",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Scripts

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build TypeScript thành JavaScript
- `npm start` - Chạy production server
- `npm test` - Chạy tests
- `npm run lint` - Kiểm tra code style
- `npm run lint:fix` - Tự động fix code style

### Migration Scripts

- `npm run migrate:generate <name>` - Tạo migration file mới
- `npm run migrate:up` - Chạy pending migrations
- `npm run migrate:down` - Rollback migration cuối cùng
- `npm run migrate:status` - Xem trạng thái migrations

## Logging

Ứng dụng sử dụng Winston để logging:

- Logs được lưu vào file `./logs/app.log`
- Console logs với màu sắc
- Log level có thể cấu hình qua biến môi trường `LOG_LEVEL`
- Authentication events được log chi tiết

## Database & TypeORM

### TypeORM Integration

Hệ thống sử dụng **TypeORM** làm ORM chính thay vì raw SQL:

- **Entity-based**: Sử dụng decorators để định nghĩa entities
- **Repository Pattern**: TypeORM Repository với type safety
- **Query Builder**: Linh hoạt và type-safe query building
- **Migrations**: TypeORM migrations với CLI
- **Relationships**: One-to-One, One-to-Many, Many-to-Many
- **Connection Pooling**: Tự động quản lý connection pool

### Database Configuration

```typescript
// TypeORM DataSource configuration
const dataSource = new DataSource({
	type: "sqlite",
	database: "./database.sqlite",
	synchronize: false, // Use migrations
	logging: process.env.NODE_ENV === "development",
	entities: [User, AuthUser],
	migrations: ["src/common/database/migrations/*.ts"],
});
```

### Entity Pattern

```typescript
// TypeORM Entity with decorators
@Entity("users")
export class User {
	@PrimaryColumn("varchar", { length: 36 })
	id!: string;

	@Column("varchar", { length: 255 })
	name!: string;

	@Column("varchar", { length: 255, unique: true })
	email!: string;

	@OneToOne(() => AuthUser, (authUser) => authUser.user)
	authUser!: AuthUser;
}
```

### Repository Pattern

```typescript
// TypeORM Repository with Query Builder
export class UserRepository {
	private repository: Repository<User>;

	async findAll(filters?: UserFilters): Promise<User[]> {
		const queryBuilder = this.repository.createQueryBuilder("user");

		if (filters?.name) {
			queryBuilder.andWhere("user.name LIKE :name", {
				name: `%${filters.name}%`,
			});
		}

		return await queryBuilder.getMany();
	}
}
```

### Migration System

```bash
# Generate migration
npm run migrate:generate -- ./src/common/database/migrations/<file-name>

# Run migrations
npm run migrate:run

# Revert migration
npm run migrate:revert

```

### Migration System

- Sử dụng SQLite làm database
- Database file được tạo tự động tại đường dẫn cấu hình trong `DB_PATH`
- Sử dụng hệ thống migration để quản lý schema

### Seed Data

Hệ thống cung cấp seed data để test:

```bash
npm run seed
npm run test:health
```

**Seed data bao gồm:**

#### Admin User

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Username**: `admin`

#### Sample Users

- **John Doe**: `john@example.com` / `password123`
- **Jane Smith**: `jane@example.com` / `password123`
- **Bob Johnson**: `bob@example.com` / `password123`

### Sử dụng Migrations

1. **Tạo migration mới:**

   ```bash
   npm run migrate:generate -- ./src/common/database/migrations/<file-name>
   ```

2. **Chạy migrations:**

   ```bash
   npm run migrate:run
   ```

3. **Rollback migration:**

   ```bash
   npm run migrate:revert
   ```

## Security

- **Helmet middleware** cho security headers
- **CORS configuration** với credentials support
- **Input validation** với express-validator
- **JWT token validation** với expiration check
- **Password hashing** với bcrypt (salt rounds = 10)
- **Role-based access control** (RBAC)
- **Protected routes** với authentication middleware
- **Exception Filter** với centralized error handling
- **Custom error classes** với type safety
- **Rate limiting** (có thể thêm nếu cần)

## Troubleshooting

### Lỗi port đã được sử dụng

Thay đổi port trong file .env:

```env
PORT=3001
```

### Lỗi database

Kiểm tra quyền ghi file trong thư mục dự án và đường dẫn database trong .env

### Lỗi dependencies

Xóa node_modules và cài lại:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi JWT

1. Kiểm tra `JWT_SECRET_KEY` trong file .env
2. Đảm bảo token không expired
3. Kiểm tra format Authorization header: `Bearer <token>`

### Lỗi Authentication

1. Đảm bảo đã đăng ký/đăng nhập thành công
2. Kiểm tra token trong Authorization header
3. Kiểm tra role permissions cho các protected routes

### Lỗi Exception Filter

1. Kiểm tra custom error classes được import đúng
2. Đảm bảo ExceptionFilter được đặt cuối middleware chain
3. Kiểm tra error logging trong console/logs

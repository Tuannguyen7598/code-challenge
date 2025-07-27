# Score Module - API Specification

## Tổng quan

Score Module được thiết kế để giải quyết 5 vấn đề chính trong hệ thống website với scoreboard:

1. **Scoreboard**: Hiển thị top 10 user có điểm cao nhất
2. **Live Update**: Cập nhật real-time scoreboard
3. **User Action**: Xử lý hành động của user và tăng điểm
4. **API Integration**: Dispatch API call khi hoàn thành hành động
5. **Security**: Ngăn chặn user malicious tăng điểm không được phép

## 1. Scoreboard - Top 10 User Scores

### Vấn đề

Website cần hiển thị scoreboard với top 10 user có điểm cao nhất.

### Cách hệ thống xử lý

- **Database Query**: Sử dụng `SUM(pointsEarned) GROUP BY userId` để tính tổng điểm từ tất cả hành động
- **Aggregation**: Mỗi user có thể có nhiều bản ghi score, hệ thống tổng hợp tất cả
- **Ordering**: Sắp xếp theo tổng điểm giảm dần và lấy top 10
- **Public Access**: Scoreboard không yêu cầu authentication

### API Endpoint

```
GET /api/scores/scoreboard
```

### Curl Commands

```bash
# Lấy top 10 scores (mặc định)
curl http://localhost:3000/api/scores/scoreboard

# Lấy top 5 scores
curl "http://localhost:3000/api/scores/scoreboard?limit=5"

# Lấy top 20 scores
curl "http://localhost:3000/api/scores/scoreboard?limit=20"
```

### Response Example

```json
{
	"success": true,
	"data": {
		"entries": [
			{
				"rank": 1,
				"userId": 1,
				"userName": "John Doe",
				"userEmail": "john@example.com",
				"totalScore": 1500,
				"lastUpdated": "2024-01-01T12:00:00.000Z"
			},
			{
				"rank": 2,
				"userId": 2,
				"userName": "Jane Smith",
				"userEmail": "jane@example.com",
				"totalScore": 1200,
				"lastUpdated": "2024-01-01T11:30:00.000Z"
			}
		],
		"total": 10,
		"lastUpdated": "2024-01-01T12:00:00.000Z"
	},
	"message": "Scoreboard retrieved successfully"
}
```

## 2. Live Update Scoreboard

### Vấn đề

Scoreboard cần cập nhật real-time khi có thay đổi điểm số.

### Cách hệ thống xử lý

- **WebSocket Notification**: Sau khi xử lý hành động, hệ thống gửi notification qua WebSocket bảng xếp hạng mới
- **Polling Strategy**: Frontend có thể poll scoreboard định kỳ (mỗi 30 giây)

### Implementation Flow

```
1. User hoàn thành hành động
2. Backend xử lý và tạo bản ghi score
3. Backend gửi WebSocket notification
4. Frontend nhận notification
5. Frontend cập nhật scoreboard real-time
```

### Curl Commands (Polling)

```bash
# Poll scoreboard mỗi 30 giây
while true; do
  curl http://localhost:3000/api/scores/scoreboard
  sleep 5
done

# Hoặc sử dụng watch command
watch -n 30 'curl -s http://localhost:3000/api/scores/scoreboard | jq'
```

## 3. User Action Processing

### Vấn đề

User có thể thực hiện hành động (game, quiz, challenge, etc.) và cần tăng điểm khi hoàn thành.

### Cách hệ thống xử lý

- **Action Handler**: Hệ thống có method `handleAction()` để xử lý logic hành động
- **Transaction Safety**: Sử dụng Serializable transaction để đảm bảo data consistency
- **Score Creation**: Tạo bản ghi score mới thay vì cập nhật điểm tổng
- **Metadata Storage**: Lưu trữ thông tin chi tiết về hành động (description, type, metadata)

### API Endpoint

```
POST /api/scores/action
```

### Curl Commands

```bash
# Login để lấy JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Xử lý hành động và tăng điểm
curl -X POST http://localhost:3000/api/scores/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "actionDescription": "Completed level 5",
    "actionType": "game",
    "metadata": "{\"level\": 5, \"difficulty\": \"hard\"}"
  }'
```

### Response Example

```json
{
	"success": true,
	"data": {
		"status": "success"
	},
	"message": "Action handled successfully"
}
```

## 4. API Call Dispatch

### Vấn đề

Khi user hoàn thành hành động, frontend cần dispatch API call đến server để cập nhật điểm.

### Cách hệ thống xử lý

- **Frontend Integration**: Frontend gọi API ngay khi user hoàn thành hành động
- **Immediate Response**: API trả về response ngay lập tức
- **Background Processing**: Xử lý logic hành động và tạo score record
- **Error Handling**: Rollback transaction nếu có lỗi

### Implementation Flow

```
1. User hoàn thành hành động trên frontend
2. Frontend gọi POST /api/scores/action
3. Backend validate JWT token và extract user ID
4. Backend thực hiện transaction:
   - Xử lý logic hành động
   - Tạo bản ghi score mới
   - Gửi WebSocket notification
5. Backend trả về success response
6. Frontend cập nhật UI
```

### Curl Commands (Frontend Integration)

```bash
# Frontend có thể sử dụng fetch hoặc axios
curl -X POST http://localhost:3000/api/scores/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "actionDescription": "Solved puzzle",
    "actionType": "puzzle"
  }'

# Kiểm tra kết quả
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/scores/user/1
```

## 5. Security - Prevent Malicious Users

### Vấn đề

Ngăn chặn user malicious tăng điểm không được phép.

### Cách hệ thống xử lý

- **JWT Authentication**: Tất cả API calls yêu cầu valid JWT token
- **User Isolation**: User chỉ có thể thao tác với score của chính mình
- **Input Validation**: Validate tất cả input parameters
- **Transaction Safety**: Sử dụng database transaction để đảm bảo nhất quán dữ liệu

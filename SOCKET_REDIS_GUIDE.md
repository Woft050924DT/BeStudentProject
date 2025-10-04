# Hướng dẫn sử dụng Redis và Socket.IO

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd "D:\BE Remote\be"
bun install
```

### 2. Khởi động Redis và PostgreSQL
```bash
docker-compose up -d
```

### 3. Tạo file .env
Sao chép file `env.example` thành `.env` và cấu hình:
```bash
cp env.example .env
```

### 4. Chạy ứng dụng
```bash
bun run start:dev
```

## 📡 Socket.IO Events

### Client → Server Events

#### Kết nối
```javascript
const socket = io('http://localhost:3000', {
  query: { token: 'your-jwt-token' }
});
```

#### Gửi tin nhắn
```javascript
socket.emit('send_message', {
  room: 'class:123',
  message: 'Xin chào mọi người!',
  type: 'text'
});
```

#### Join room
```javascript
socket.emit('join_room', { room: 'class:123' });
```

#### Leave room
```javascript
socket.emit('leave_room', { room: 'class:123' });
```

#### Typing indicator
```javascript
socket.emit('typing', { 
  room: 'class:123', 
  isTyping: true 
});
```

#### Lấy danh sách user online
```javascript
socket.emit('get_online_users');
```

### Server → Client Events

#### Kết nối thành công
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

#### Tin nhắn mới
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

#### User join/leave room
```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data);
});

socket.on('user_left', (data) => {
  console.log('User left:', data);
});
```

#### Typing indicator
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
});
```

#### Thông báo hệ thống
```javascript
socket.on('system_notification', (notification) => {
  console.log('System notification:', notification);
});
```

#### User online/offline
```javascript
socket.on('user_online', (data) => {
  console.log('User online:', data);
});

socket.on('user_offline', (data) => {
  console.log('User offline:', data);
});
```

## 🔴 Redis Usage

### Trong Service
```typescript
import { RedisService } from '../redis/redis.service';

@Injectable()
export class YourService {
  constructor(private redisService: RedisService) {}

  async cacheData(key: string, data: any) {
    await this.redisService.cache(key, data, 3600); // Cache 1 giờ
  }

  async getCachedData(key: string) {
    return await this.redisService.getCache(key);
  }

  async setSession(sessionId: string, data: any) {
    await this.redisService.setSession(sessionId, data, 86400); // 24 giờ
  }
}
```

### Trong Socket Service
```typescript
import { SocketService } from '../socket/socket.service';

@Injectable()
export class YourService {
  constructor(private socketService: SocketService) {}

  async notifyUser(userId: string, message: string) {
    await this.socketService.sendToUser(userId, 'notification', {
      message,
      timestamp: new Date().toISOString()
    });
  }

  async notifyClass(classId: string, message: string) {
    await this.socketService.sendClassNotification(classId, message);
  }
}
```

## 🏗️ Room Structure

### Room Types
- `user:{userId}` - Room riêng của user
- `role:{role}` - Room theo role (admin, teacher, student)
- `class:{classId}` - Room của lớp học
- `faculty:{facultyId}` - Room của khoa
- `department:{departmentId}` - Room của bộ môn

### Ví dụ sử dụng
```typescript
// Gửi thông báo cho tất cả admin
await this.socketService.sendToRole('admin', 'new_student_registered', {
  studentId: '123',
  studentName: 'Nguyễn Văn A'
});

// Gửi thông báo cho lớp học
await this.socketService.sendClassNotification('class123', 'Có bài tập mới', {
  assignmentId: '456',
  title: 'Bài tập Toán'
});
```

## 🔧 Configuration

### Environment Variables
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Application
PORT=3000
JWT_SECRET=your-secret-key
```

### Docker Compose
Redis và PostgreSQL sẽ chạy trên:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 🐛 Troubleshooting

### Redis Connection Error
1. Kiểm tra Redis container đang chạy: `docker ps`
2. Kiểm tra port 6379 có bị chiếm không
3. Kiểm tra file .env có đúng cấu hình Redis

### Socket.IO Connection Error
1. Kiểm tra JWT token có hợp lệ không
2. Kiểm tra CORS configuration
3. Kiểm tra client có kết nối đúng URL không

### Performance Tips
1. Sử dụng Redis adapter cho Socket.IO clustering
2. Cache dữ liệu thường xuyên truy cập
3. Sử dụng room để giảm broadcast không cần thiết
4. Implement rate limiting cho Socket.IO events

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Socket.IO Gateway initialized');
    
    // Cấu hình Redis adapter cho Socket.IO
    const { createAdapter } = require('@socket.io/redis-adapter');
    const adapter = createAdapter(
      this.redisService.getPublisher(),
      this.redisService.getSubscriber(),
    );
    
    // Thiết lập adapter cho server - trong Socket.IO v4, adapter là thuộc tính, không phải hàm
    (server as any).adapter = adapter;
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Xác thực JWT token từ query hoặc headers
      const token = client.handshake.query.token as string || 
                   client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Lưu thông tin user vào Redis
      await this.redisService.setSession(
        `socket:${client.id}`,
        { userId: client.userId, userRole: client.userRole },
        3600
      );

      // Lưu mapping userId -> socketId
      if (client.userId) {
        this.connectedUsers.set(client.userId, client.id);
        await this.redisService.set(`user:socket:${client.userId}`, client.id, 3600);

        // Join user vào room riêng của họ
        client.join(`user:${client.userId}`);
      }
      
      // Join user vào room theo role
      if (client.userRole) {
        client.join(`role:${client.userRole}`);
      }

      this.logger.log(`User ${client.userId} connected with socket ${client.id}`);
      
      // Thông báo cho user về việc kết nối thành công
      client.emit('connected', { 
        message: 'Connected successfully',
        userId: client.userId,
        userRole: client.userRole 
      });

      // Thông báo cho admin về user mới online
      if (client.userId) {
        this.server.to('role:admin').emit('user_online', {
          userId: client.userId,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error);
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Xóa mapping
      this.connectedUsers.delete(client.userId);
      await this.redisService.del(`user:socket:${client.userId}`);
      await this.redisService.del(`socket:${client.id}`);

      this.logger.log(`User ${client.userId} disconnected`);

      // Thông báo cho admin về user offline
      if (client.userId) {
        this.server.to('role:admin').emit('user_offline', {
          userId: client.userId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // Xử lý tin nhắn chat
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { room: string; message: string; type?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const messageData = {
      id: Date.now().toString(),
      userId: client.userId,
      userRole: client.userRole,
      room: data.room,
      message: data.message,
      type: data.type || 'text',
      timestamp: new Date().toISOString(),
    };

    // Lưu tin nhắn vào Redis
    await this.redisService.set(
      `message:${messageData.id}`,
      JSON.stringify(messageData),
      86400
    );

    // Gửi tin nhắn đến room
    this.server.to(data.room).emit('new_message', messageData);
    
    this.logger.log(`Message sent to room ${data.room} by user ${client.userId}`);
  }

  // Join room
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.join(data.room);
    client.emit('joined_room', { room: data.room });
    
    // Thông báo cho room về user mới join
    if (client.userId) {
      client.to(data.room).emit('user_joined', {
        userId: client.userId,
        room: data.room,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${client.userId} joined room ${data.room}`);
    }
  }

  // Leave room
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.leave(data.room);
    client.emit('left_room', { room: data.room });
    
    // Thông báo cho room về user rời đi
    if (client.userId) {
      client.to(data.room).emit('user_left', {
        userId: client.userId,
        room: data.room,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${client.userId} left room ${data.room}`);
    }
  }

  // Typing indicator
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { room: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return;
    }

    client.to(data.room).emit('user_typing', {
      userId: client.userId,
      room: data.room,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  // Lấy danh sách user online
  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const onlineUsers = Array.from(this.connectedUsers.keys());
    client.emit('online_users', { users: onlineUsers });
  }

  // Phương thức để gửi thông báo cho user cụ thể
  async sendToUser(userId: string, event: string, data: any) {
    const socketId = await this.redisService.get(`user:socket:${userId}`);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Phương thức để gửi thông báo cho role cụ thể
  async sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // Phương thức để gửi thông báo cho room cụ thể
  async sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  // Phương thức để broadcast thông báo
  async broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}

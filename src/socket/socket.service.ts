import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  // Gửi thông báo cho user cụ thể
  async sendToUser(userId: string, event: string, data: any) {
    return this.socketGateway.sendToUser(userId, event, data);
  }

  // Gửi thông báo cho role cụ thể
  async sendToRole(role: string, event: string, data: any) {
    return this.socketGateway.sendToRole(role, event, data);
  }

  // Gửi thông báo cho room cụ thể
  async sendToRoom(room: string, event: string, data: any) {
    return this.socketGateway.sendToRoom(room, event, data);
  }

  // Broadcast thông báo cho tất cả user
  async broadcast(event: string, data: any) {
    return this.socketGateway.broadcast(event, data);
  }

  // Gửi thông báo đăng nhập thành công
  async notifyLoginSuccess(userId: string, userRole: string) {
    await this.sendToUser(userId, 'login_success', {
      message: 'Đăng nhập thành công',
      userId,
      userRole,
      timestamp: new Date().toISOString(),
    });
  }

  // Gửi thông báo đăng xuất
  async notifyLogout(userId: string) {
    await this.sendToUser(userId, 'logout', {
      message: 'Đã đăng xuất',
      timestamp: new Date().toISOString(),
    });
  }

  // Gửi thông báo cho admin về hoạt động của user
  async notifyAdminUserActivity(userId: string, activity: string, details?: any) {
    await this.sendToRole('admin', 'user_activity', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Gửi thông báo hệ thống
  async sendSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    await this.broadcast('system_notification', {
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  // Gửi thông báo cho lớp học
  async sendClassNotification(classId: string, message: string, data?: any) {
    await this.sendToRoom(`class:${classId}`, 'class_notification', {
      classId,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Gửi thông báo cho khoa
  async sendFacultyNotification(facultyId: string, message: string, data?: any) {
    await this.sendToRoom(`faculty:${facultyId}`, 'faculty_notification', {
      facultyId,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

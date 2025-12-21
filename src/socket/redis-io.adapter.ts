import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  constructor(
    private readonly redisService: RedisService,
  ) {
    super();
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    
    // Tạo Redis adapter
    const redisAdapter = createAdapter(
      this.redisService.getPublisher(),
      this.redisService.getSubscriber(),
    );
    
    // Thiết lập adapter trên default namespace
    // Trong Socket.IO v4, adapter được thiết lập trên namespace
    const defaultNamespace = server.of('/');
    defaultNamespace.adapter = redisAdapter;
    
    return server;
  }
}


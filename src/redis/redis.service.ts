import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };

    // Tạo Redis client chính
    this.client = new Redis(redisConfig);
    
    // Tạo Redis subscriber cho Socket.IO
    this.subscriber = new Redis(redisConfig);
    
    // Tạo Redis publisher cho Socket.IO
    this.publisher = new Redis(redisConfig);

    // Xử lý lỗi kết nối
    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis Subscriber Error:', error);
    });

    this.publisher.on('error', (error) => {
      console.error('Redis Publisher Error:', error);
    });

    console.log('Redis connection established');
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }

  // Các phương thức cơ bản cho Redis
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  // Các phương thức cho Socket.IO
  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  // Phương thức cho caching
  async cache(key: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(key, JSON.stringify(data), ttl);
  }

  async getCache(key: string): Promise<any> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Phương thức cho session management
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, JSON.stringify(data), ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    const data = await this.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }
}

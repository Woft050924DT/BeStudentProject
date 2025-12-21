import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';
import { RedisIoAdapter } from './redis-io.adapter';

@Module({
  imports: [RedisModule, JwtModule],
  providers: [SocketGateway, SocketService, RedisIoAdapter],
  exports: [SocketGateway, SocketService, RedisIoAdapter],
})
export class SocketModule {}

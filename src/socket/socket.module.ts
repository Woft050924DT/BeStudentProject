import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [RedisModule, JwtModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}

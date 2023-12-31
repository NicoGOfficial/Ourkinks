import { Module, forwardRef } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigService } from 'nestjs-config';
import { AgendaModule, QueueModule } from 'src/kernel';
import { SocketUserService } from './services/socket-user.service';
import { WsUserConnectedGateway } from './gateways/user-connected.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    QueueModule,
    AgendaModule.register(),
    // https://github.com/kyknow/@liaoliaots/nestjs-redis
    RedisModule.forRootAsync({
      // TODO - load config for redis socket
      useFactory: (configService: ConfigService) => ({
        config: configService.get('redis')
      }),
      // useFactory: async (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    forwardRef(() => AuthModule)
  ],
  providers: [SocketUserService, WsUserConnectedGateway],
  controllers: [],
  exports: [SocketUserService]
})
export class SocketModule { }

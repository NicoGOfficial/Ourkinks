import { Module, forwardRef } from '@nestjs/common';
import * as https from 'https';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { SubscriptionModule } from 'src/modules/subscription/subscription.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigService } from 'nestjs-config';
import { HttpModule } from '@nestjs/axios';
import { assetsProviders } from './providers/stream.provider';
import { PerformerModule } from '../performer/performer.module';
import { AuthModule } from '../auth/auth.module';
import { StreamService, RequestService } from './services';
import { StreamController } from './controllers';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import { SocketModule } from '../socket/socket.module';
import { StreamConversationWsGateway, PrivateStreamWsGateway, PublicStreamWsGateway } from './gateways';
import { StreamMessageListener, StreamConnectListener } from './listeners';
import { SettingModule } from '../settings/setting.module';
import { PerformerDisconnectListener } from './listeners/performer-disconnect.listener';

const agent = new https.Agent({
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED !== 'false'
});

@Module({
  imports: [
    MongoDBModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      httpsAgent: agent
    }),
    QueueModule.forRoot(),
    // https://github.com/kyknow/@liaoliaots/nestjs-redis
    RedisModule.forRootAsync({
      // // TODO - load config for redis socket
      useFactory: (configService: ConfigService) => ({
        config: configService.get('redis')
      }),
      // useFactory: async (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    UserModule,
    SubscriptionModule,
    MessageModule,
    forwardRef(() => SocketModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => MessageModule),
    forwardRef(() => SettingModule)
  ],
  providers: [
    ...assetsProviders,
    StreamService,
    RequestService,
    StreamMessageListener,
    StreamConnectListener,
    StreamConversationWsGateway,
    PrivateStreamWsGateway,
    PublicStreamWsGateway,
    PerformerDisconnectListener
  ],
  controllers: [StreamController],
  exports: [StreamService]
})
export class StreamModule { }

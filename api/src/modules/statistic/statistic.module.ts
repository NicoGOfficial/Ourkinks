import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongoDBModule } from 'src/kernel';
import {
  PerformerStatisticService,
  StatisticService
} from './services';
import {
  StatisticController,
  PerformerStatisticController
} from './controllers';
import { AuthModule } from '../auth/auth.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { PerformerModule } from '../performer/performer.module';
import { UserModule } from '../user/user.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentModule } from '../payment/payment.module';
import { EarningModule } from '../earning/earning.module';
import { providers } from './providers';
import {
  UpdatePerformerCommentStatsListener,
  UpdatePerformerReactionStatsListener,
  UpdatePerformerSubscriptionStatsListener,
  UpdatePerformerVideoStatsListener,
  UpdatePerformerStreamTimeStatsListener,
  UpdatePerformerEarningStatsListener
} from './listeners';
import { CommentModule } from '../comment/comment.module';
import { ReactionModule } from '../reaction/reaction.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => EarningModule),
    forwardRef(() => CommentModule),
    forwardRef(() => ReactionModule)
  ],
  providers: [
    ...providers,
    StatisticService,
    PerformerStatisticService,
    UpdatePerformerCommentStatsListener,
    UpdatePerformerReactionStatsListener,
    UpdatePerformerSubscriptionStatsListener,
    UpdatePerformerVideoStatsListener,
    UpdatePerformerStreamTimeStatsListener,
    UpdatePerformerEarningStatsListener
  ],
  controllers: [
    StatisticController,
    PerformerStatisticController
  ],
  exports: [StatisticService]
})
export class StatisticModule { }

import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { EVENT } from '../../../kernel/constants';
import { SUBSCRIPTION_CHANNEL } from '../../subscription/constants';
import { QueueEventService, QueueEvent } from '../../../kernel';
import { SubscriptionDto } from '../../subscription/dtos';
import { PerformerMonthlyStatsModel } from '../models/index';
import { PERFORMER_MONTHLY_STATS_PROVIDER } from '../providers';
import { PerformerStatisticService } from '../services';

const UPDATE_NEW_SUBSCRIPTION_STATS = 'UPDATE_NEW_SUBSCRIPTION_STATS';

@Injectable()
export class UpdatePerformerSubscriptionStatsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly PerformerMonthlyStats: Model<PerformerMonthlyStatsModel>,
    private readonly performerStatisticService: PerformerStatisticService
  ) {
    this.queueEventService.subscribe(
      SUBSCRIPTION_CHANNEL,
      UPDATE_NEW_SUBSCRIPTION_STATS,
      this.handleNewSubscriptionStats.bind(this)
    );
  }

  public async handleNewSubscriptionStats(
    event: QueueEvent
  ): Promise<any> {
    const subscription = event.data as SubscriptionDto;

    const stats = await this.performerStatisticService.getCurrentMonthStats(subscription.performerId);
    const inc = [EVENT.CREATED, EVENT.UPDATED].includes(event.eventName) ? 1 : -1;

    await this.PerformerMonthlyStats.updateOne(
      { _id: stats._id },
      {
        $inc: {
          totalNewSubscriptions: inc
        }
      }
    );
    return null;
  }
}

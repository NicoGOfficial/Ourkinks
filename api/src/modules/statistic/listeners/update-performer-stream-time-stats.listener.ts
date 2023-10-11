import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { MODEL_LIVE_STREAM_CHANNEL, LIVE_STREAM_EVENT_NAME } from 'src/modules/stream/constant';
import { QueueEventService, QueueEvent } from '../../../kernel';
import { PerformerMonthlyStatsModel } from '../models/index';
import { PERFORMER_MONTHLY_STATS_PROVIDER } from '../providers';
import { PerformerStatisticService } from '../services';

const UPDATE_STREAM_TIME_MONTHLY_STATS = 'UPDATE_STREAM_TIME_MONTHLY_STATS';

@Injectable()
export class UpdatePerformerStreamTimeStatsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly PerformerMonthlyStats: Model<PerformerMonthlyStatsModel>,
    private readonly performerStatisticService: PerformerStatisticService
  ) {
    this.queueEventService.subscribe(
      MODEL_LIVE_STREAM_CHANNEL,
      UPDATE_STREAM_TIME_MONTHLY_STATS,
      this.handleEarningStats.bind(this)
    );
  }

  public async handleEarningStats(
    event: QueueEvent
  ): Promise<any> {
    if (event.eventName !== LIVE_STREAM_EVENT_NAME.ENDED) return null;
    const { performerId, streamTime } = event.data;

    const stats = await this.performerStatisticService.getCurrentMonthStats(performerId);

    await this.PerformerMonthlyStats.updateOne(
      { _id: stats._id },
      {
        $inc: {
          totalStreamingTime: streamTime
        }
      }
    );

    return null;
  }
}

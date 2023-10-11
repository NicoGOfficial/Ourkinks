import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { EarningModel } from 'src/modules/earning/models/earning.model';
import { PERFORMER_VIDEO_CHANNEL } from 'src/modules/performer-assets/services';
import { EVENT } from '../../../kernel/constants';
import { QueueEventService, QueueEvent } from '../../../kernel';
import { PerformerMonthlyStatsModel } from '../models/index';
import { PERFORMER_MONTHLY_STATS_PROVIDER } from '../providers';
import { PerformerStatisticService } from '../services';

const UPDATE_VIDEO_MONTHLY_STATS = 'UPDATE_VIDEO_MONTHLY_STATS';

@Injectable()
export class UpdatePerformerVideoStatsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly PerformerMonthlyStats: Model<PerformerMonthlyStatsModel>,
    private readonly performerStatisticService: PerformerStatisticService
  ) {
    this.queueEventService.subscribe(
      PERFORMER_VIDEO_CHANNEL,
      UPDATE_VIDEO_MONTHLY_STATS,
      this.handleListener.bind(this)
    );
  }

  public async handleListener(
    event: QueueEvent
  ): Promise<any> {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) return null;
    const earning = event.data as EarningModel;

    const stats = await this.performerStatisticService.getCurrentMonthStats(earning.performerId);
    const inc = event.eventName === EVENT.CREATED ? 1 : -1;

    await this.PerformerMonthlyStats.updateOne(
      { _id: stats._id },
      {
        $inc: {
          totalNewVideos: inc
        }
      }
    );
    return null;
  }
}

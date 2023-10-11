import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { EarningModel } from 'src/modules/earning/models/earning.model';
import { PAYMENT_WALLET_CHANNEL } from 'src/modules/payment/constants';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { EVENT } from '../../../kernel/constants';
import { QueueEventService, QueueEvent } from '../../../kernel';
import { PerformerMonthlyStatsModel } from '../models/index';
import { PERFORMER_MONTHLY_STATS_PROVIDER } from '../providers';
import { PerformerStatisticService } from '../services';

const UPDATE_EARNING_MONTHLY_STATS = 'UPDATE_EARNING_MONTHLY_STATS';

@Injectable()
export class UpdatePerformerEarningStatsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly PerformerMonthlyStats: Model<PerformerMonthlyStatsModel>,
    private readonly performerStatisticService: PerformerStatisticService
  ) {
    this.queueEventService.subscribe(
      PAYMENT_WALLET_CHANNEL,
      UPDATE_EARNING_MONTHLY_STATS,
      this.handleEarningStats.bind(this)
    );
  }

  public async handleEarningStats(
    event: QueueEvent
  ): Promise<any> {
    if (event.eventName !== EVENT.CREATED) return null;
    const orderedItem = event.data.order as EarningModel;

    // Search the current month's statistics collection. If not available, will generate the current month's statistics collection
    const stats = await this.performerStatisticService.getCurrentMonthStats(orderedItem.sellerId);

    let commission = 0.2;
    if (orderedItem.type === 'stream_private') {
      const privateChatCommission = SettingService.getValueByKey(SETTING_KEYS.PRIVATE_CHAT_COMMISSION);
      commission = privateChatCommission;
    }

    if (orderedItem.type === 'tip') {
      const tipCommission = SettingService.getValueByKey(SETTING_KEYS.TOKEN_TIP_COMMISSION);
      commission = tipCommission;
    }

    if (orderedItem.type === 'performer_product') {
      const productSaleCommission = SettingService.getValueByKey(SETTING_KEYS.PRODUCT_SALE_COMMISSION);
      commission = productSaleCommission;
    }

    if (orderedItem.type === 'sale_video') {
      const videoSaleCommission = SettingService.getValueByKey(SETTING_KEYS.VIDEO_SALE_COMMISSION);
      commission = videoSaleCommission;
    }

    // Deduct commission percentage
    const netPrice = orderedItem.totalPrice - (orderedItem.totalPrice * commission);

    await this.PerformerMonthlyStats.updateOne(
      { _id: stats._id },
      {
        $inc: {
          totalEarning: netPrice
        }
      }
    );

    if (orderedItem.type === 'tip') {
      await this.PerformerMonthlyStats.updateOne(
        { _id: stats._id },
        {
          $inc: {
            totalTips: netPrice
          }
        }
      );
    }

    return null;
  }
}

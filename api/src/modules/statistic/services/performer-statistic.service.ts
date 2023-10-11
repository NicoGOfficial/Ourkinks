import * as moment from 'moment';
import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { SUBSCRIPTION_STATUS } from 'src/modules/subscription/constants';
import { ObjectId } from 'mongodb';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../../subscription/providers/subscription.provider';
import { SubscriptionModel } from '../../subscription/models/subscription.model';
import { ORDER_DETAIL_MODEL_PROVIDER } from '../../payment/providers';
import { OrderDetailsModel } from '../../payment/models';
import {
  PERFORMER_VIDEO_MODEL_PROVIDER
} from '../../performer-assets/providers';
import {
  VideoModel
} from '../../performer-assets/models';
import { PERFORMER_MONTHLY_STATS_PROVIDER, PERFORMER_STATS_PROVIDER } from '../providers';
import { PerformerMonthlyStatsModel, PerformerStatsModel } from '../models';
import { ORDER_STATUS } from '../../payment/constants';

@Injectable()
export class PerformerStatisticService {
  constructor(
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    @Inject(ORDER_DETAIL_MODEL_PROVIDER)
    private readonly orderDetailModel: Model<OrderDetailsModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(PERFORMER_STATS_PROVIDER)
    private readonly performerStats: Model<PerformerStatsModel>,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly performerMonthlyStats: Model<PerformerMonthlyStatsModel>
  ) { }

  public async getCurrentMonthStats(performerId) {
    const currentMonth = 1 + moment().month();
    const currentYear = moment().year();

    const stats = await this.performerMonthlyStats.findOne({
      performerId,
      month: currentMonth,
      year: currentYear
    });

    if (!stats) {
      const newStats = await this.performerMonthlyStats.create({
        performerId: new ObjectId(performerId),
        month: currentMonth,
        year: currentYear,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newStats;
    }

    return stats;
  }

  public async stats(performerId): Promise<any> {
    const totalSubscribers = await this.subscriptionModel.countDocuments({ performerId: new ObjectId(performerId) });

    const totalUnsubscribe = await this.subscriptionModel.countDocuments({ performerId: new ObjectId(performerId), status: SUBSCRIPTION_STATUS.DEACTIVATED });

    const totalProductsSold = await this.orderDetailModel.countDocuments({
      productType: {
        $ne: 'tip'
      },
      sellerId: new ObjectId(performerId),
      status: ORDER_STATUS.PAID
    });

    const totalPPVvideo = await this.videoModel.countDocuments({ performerId: new ObjectId(performerId), isSaleVideo: true });

    const performerStats = await this.performerStats.findOne({ performerId: new ObjectId(performerId) });

    const totalPPVVideoSold = await this.orderDetailModel.countDocuments({
      sellerId: new ObjectId(performerId),
      productType: 'sale_video'
    });

    const totalPPVGallerySold = await this.orderDetailModel.countDocuments({
      sellerId: new ObjectId(performerId),
      productType: 'sale_gallery'
    });

    const totalPPVPhysicalSold = await this.orderDetailModel.countDocuments({
      sellerId: new ObjectId(performerId),
      productType: 'physical'
    });

    const totalPPVDigitalSold = await this.orderDetailModel.countDocuments({
      sellerId: new ObjectId(performerId),
      productType: 'digital'
    });

    return {
      totalSubscribers,
      totalUnsubscribe,
      totalProductsSold,
      totalPPVvideo,
      totalPPVVideoSold,
      totalPPVGallerySold,
      totalPPVPhysicalSold,
      totalPPVDigitalSold,
      performerStats
    };
  }

  public async getStatsForLast12Months(performerId) {
    const end = moment().endOf('month').toDate();
    const start = moment(end).add(-12, 'month').startOf('month').toDate();

    return this.performerMonthlyStats.find({
      performerId,
      createdAt: {
        $gte: start,
        $lte: end
      }
    })
      .sort({
        createdAt: 1
      });
  }
}

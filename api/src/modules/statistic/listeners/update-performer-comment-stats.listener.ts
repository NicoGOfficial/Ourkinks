import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { CommentDto } from 'src/modules/comment/dtos/comment.dto';
import {
  PERFORMER_PRODUCT_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER, PERFORMER_GALLERY_MODEL_PROVIDER
} from 'src/modules/performer-assets/providers';
import {
  GalleryModel, VideoModel, ProductModel
} from 'src/modules/performer-assets/models';
import { EVENT } from 'src/kernel/constants';
import { COMMENT_CHANNEL, OBJECT_TYPE } from 'src/modules/comment/contants';
import { PERFORMER_MONTHLY_STATS_PROVIDER, PERFORMER_STATS_PROVIDER } from '../providers';
import { PerformerMonthlyStatsModel, PerformerStatsModel } from '../models';
import { PerformerStatisticService } from '../services';

const UPDATE_PERFORMER_COMMENT_STATS_TOPIC = 'UPDATE_PERFORMER_COMMENT_STATS_TOPIC';

@Injectable()
export class UpdatePerformerCommentStatsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly Gallery: Model<GalleryModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly Product: Model<ProductModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly Video: Model<VideoModel>,
    @Inject(PERFORMER_STATS_PROVIDER)
    private readonly PerformerStats: Model<PerformerStatsModel>,
    @Inject(PERFORMER_MONTHLY_STATS_PROVIDER)
    private readonly PerformerMonthlyStats: Model<PerformerMonthlyStatsModel>,
    private readonly performerStatisticService: PerformerStatisticService
  ) {
    this.queueEventService.subscribe(
      COMMENT_CHANNEL,
      UPDATE_PERFORMER_COMMENT_STATS_TOPIC,
      this.handleListen.bind(this)
    );
  }

  private async getPerformerIdFromComment(comment: CommentDto) {
    switch (comment.objectType) {
      case OBJECT_TYPE.VIDEO: {
        const video = await this.Video.findById(comment.objectId);
        return video?.performerId;
      }
      case OBJECT_TYPE.GALLERY: {
        const gallery = await this.Gallery.findById(comment.objectId);
        return gallery?.performerId;
      }
      case OBJECT_TYPE.PRODUCT: {
        const product = await this.Product.findById(comment.objectId);
        return product?.performerId;
      }
      default: return null;
    }
  }

  public async handleListen(
    event: QueueEvent
  ): Promise<any> {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) return null;
    const comment = event.data as CommentDto;
    const performerId = await this.getPerformerIdFromComment(comment);
    if (!performerId) return null;
    let stats = await this.PerformerStats.findOne({ performerId });
    if (!stats) stats = await this.PerformerStats.create({ performerId });
    const increase = event.eventName === EVENT.CREATED ? 1 : -1;
    await this.PerformerStats.updateOne({ _id: stats._id }, {
      $inc: {
        totalAllComments: increase
      }
    });

    const currentMonthStats = await this.performerStatisticService.getCurrentMonthStats(performerId);
    await this.PerformerStats.updateOne({ _id: currentMonthStats._id }, {
      $inc: {
        totalAllComments: increase
      }
    });

    return null;
  }
}

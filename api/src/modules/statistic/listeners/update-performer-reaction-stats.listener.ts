import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { REACTION, REACTION_CHANNEL, REACTION_TYPE } from 'src/modules/reaction/constants';
import { ReactionDto } from 'src/modules/reaction/dtos/reaction.dto';
import {
  PERFORMER_PRODUCT_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER, PERFORMER_GALLERY_MODEL_PROVIDER
} from 'src/modules/performer-assets/providers';
import {
  GalleryModel, VideoModel, ProductModel
} from 'src/modules/performer-assets/models';
import { EVENT } from 'src/kernel/constants';
import { PerformerMonthlyStatsModel, PerformerStatsModel } from '../models';
import { PERFORMER_MONTHLY_STATS_PROVIDER, PERFORMER_STATS_PROVIDER } from '../providers';
import { PerformerStatisticService } from '../services';

const UPDATE_PEFORMER_REACTON_STATS_TOPIC = 'UPDATE_PEFORMER_REACTON_STATS_TOPIC';

@Injectable()
export class UpdatePerformerReactionStatsListener {
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
      REACTION_CHANNEL,
      UPDATE_PEFORMER_REACTON_STATS_TOPIC,
      this.handleListen.bind(this)
    );
  }

  private async getPerformerIdFromReaction(reaction: ReactionDto) {
    switch (reaction.objectType) {
      case REACTION_TYPE.VIDEO: {
        const video = await this.Video.findById(reaction.objectId);
        return video?.performerId;
      }
      case REACTION_TYPE.GALLERY: {
        const gallery = await this.Gallery.findById(reaction.objectId);
        return gallery?.performerId;
      }
      case REACTION_TYPE.PRODUCT: {
        const product = await this.Product.findById(reaction.objectId);
        return product?.performerId;
      }
      default: return null;
    }
  }

  public async handleListen(
    event: QueueEvent
  ): Promise<any> {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) return null;
    const reaction = event.data as ReactionDto;
    const performerId = await this.getPerformerIdFromReaction(reaction);
    if (!performerId) return null;
    let stats = await this.PerformerStats.findOne({ performerId });
    if (!stats) stats = await this.PerformerStats.create({ performerId });

    const currentMonthStats = await this.performerStatisticService.getCurrentMonthStats(performerId);

    const increase = event.eventName === EVENT.CREATED ? 1 : -1;
    switch (reaction.action) {
      case REACTION.LIKE: {
        await this.PerformerStats.updateOne({ _id: stats._id }, {
          $inc: {
            totalAllLikes: increase
          }
        });
        await this.PerformerMonthlyStats.updateOne({ _id: currentMonthStats._id }, {
          $inc: {
            totalAllLikes: increase
          }
        });
        break;
      }
      case REACTION.FAVOURITE: {
        await this.PerformerStats.updateOne({ _id: stats._id }, {
          $inc: {
            totalVideoFavourites: increase
          }
        });
        await this.PerformerMonthlyStats.updateOne({ _id: currentMonthStats._id }, {
          $inc: {
            totalVideoFavourites: increase
          }
        });
        break;
      }
      default: break;
    }
    return null;
  }
}

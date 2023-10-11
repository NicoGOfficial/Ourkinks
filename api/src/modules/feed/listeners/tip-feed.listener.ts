import { QueueEvent, QueueEventService } from 'src/kernel';
import { Injectable, Inject } from '@nestjs/common';
import { EVENT } from 'src/kernel/constants';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { Model } from 'mongoose';
import { FeedModel } from '../models';
import { FEED_PROVIDER } from '../providers/index';

const TIP_FEED = 'TIP_FEED';

@Injectable()
export class TipFeedListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>
  ) {
    this.queueEventService.subscribe(
      'PAYMENT_WALLET_CHANNEL',
      TIP_FEED,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    const { eventName } = event;
    const { feedId, orderDetail } = event.data;
    if (eventName !== EVENT.CREATED || !feedId) {
      return;
    }

    const feed = await this.feedModel.findOne({ _id: feedId });
    if (!feed) {
      return;
    }
    await this.feedModel.updateOne({ _id: feedId }, { $inc: { totalTips: orderDetail.totalPrice } });
    // await this.socketUserService.emitToUsers(orderDetail.buyerId, TIP_FEED, {
    //   feedId,
    //   amount: orderDetail.totalPrice
    // });
  }
}

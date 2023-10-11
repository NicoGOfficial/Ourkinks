import { Injectable, Logger } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { NOTIFICATION_CHANNEL } from '../notification.constant';
import { NotificationService } from '../services';

const HANDLE_TIP_NOTIFICATION = 'HANDLE_TIP_NOTIFICATION';

@Injectable()
export class TipNotificationListener {
  private logger = new Logger(TipNotificationListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      'TIP_PERFORMER_CHANNEL',
      HANDLE_TIP_NOTIFICATION,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (eventName !== EVENT.CREATED) return;
      const {
        performerId, description, amount, user
      } = event.data;
      const { avatar } = user;
      const notification = await this.notificationService.create({
        type: 'tipped',
        action: 'created',
        userId: performerId,
        refId: null,
        createdBy: user._id,
        title: `You received a ${amount}$ tip from ${user.username}: "${description}"`,
        message: '',
        thumbnail: avatar
      });

      await this.queueEventService.publish({
        eventName: EVENT.CREATED,
        channel: NOTIFICATION_CHANNEL,
        data: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

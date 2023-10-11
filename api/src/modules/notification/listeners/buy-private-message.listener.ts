import {
  Injectable, Logger, OnModuleInit
} from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { NotificationService } from 'src/modules/notification/services';
import { PRIVATE_MESSAGE_CHANNEL } from 'src/modules/payment/constants';
import { NOTIFICATION_CHANNEL } from '../notification.constant';

// const BUY_PRIVATE_MESSAGE_CONTENT_SUCCESS = 'BUY_PRIVATE_MESSAGE_CONTENT_SUCCESS';

@Injectable()
export class PrivateMessageListener implements OnModuleInit {
  private logger = new Logger(PrivateMessageListener.name);

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly notificationService: NotificationService
  ) {}

  onModuleInit() {
    this.queueEventService.subscribe(
      PRIVATE_MESSAGE_CHANNEL,
      EVENT.CREATED,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (eventName !== EVENT.CREATED) return;

      const {
        performerId, message, user
      } = event.data;

      const { avatar } = user;
      const notification = await this.notificationService.create({
        type: 'private_message_content',
        action: 'created',
        userId: performerId,
        refId: null,
        createdBy: user._id,
        title: `${user.username} bought your private message: "${message.text}"`,
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

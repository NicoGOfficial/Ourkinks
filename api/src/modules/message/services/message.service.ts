import {
  Injectable,
  Inject,
  ForbiddenException,
  HttpException,
  Logger,
  forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { QueueEventService, EntityNotFoundException, QueueEvent } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { FileDto } from 'src/modules/file';
import { FILE_EVENT, FileService } from 'src/modules/file/services';
import { REF_TYPE } from 'src/modules/file/constants';
import { PerformerDto } from 'src/modules/performer/dtos';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { uniq } from 'lodash';
import { CheckPaymentService } from 'src/modules/payment/services';
import { ORDER_STATUS } from 'src/modules/payment/constants';
import { MessageModel, IRecipient } from '../models';
import { MESSAGE_MODEL_PROVIDER } from '../providers/message.provider';
import { MessageCreatePayload } from '../payloads/message-create.payload';
import {
  MESSAGE_CHANNEL,
  MESSAGE_EVENT,
  MESSAGE_PRIVATE_STREAM_CHANNEL,
  MESSAGE_TYPE
} from '../constants';
import { MessageDto } from '../dtos';
import { ConversationService } from './conversation.service';
import { MessageListRequest } from '../payloads/message-list.payload';

export const PAID_MESSAGE_CHANNEL = 'PAID_MESSAGE_CHANNEL';

@Injectable()
export class MessageService {
  private logger = new Logger(MessageService.name);

  constructor(
    @Inject(MESSAGE_MODEL_PROVIDER)
    private readonly messageModel: Model<MessageModel>,
    private readonly queueEventService: QueueEventService,
    private readonly fileService: FileService,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => CheckPaymentService))
    private readonly checkPaymentService: CheckPaymentService
  ) {
    this.queueEventService.subscribe(PAID_MESSAGE_CHANNEL, 'PROCESS_PAID_MESSAGE', this.handler.bind(this));
  }

  async handler(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (eventName !== FILE_EVENT.PHOTO_PROCESSED) return;

      const { id } = event.data.meta;
      const { fileId } = event.data;
      const message = await this.messageModel.findById(id);
      if (!message) return;

      const file = await this.fileService.findById(fileId);

      const dto = new MessageDto(message);
      dto.imageUrl = file.getThumbnail();

      message.ok = true;
      await message.save();
      await this.queueEventService.publish({
        channel: MESSAGE_CHANNEL,
        eventName: MESSAGE_EVENT.CREATED,
        data: dto
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async createPrivateMessage(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      (recipient) => recipient.sourceId.toString() === sender.sourceId.toString()
    );

    if (!found) {
      throw new EntityNotFoundException();
    }

    const checkIsSale = payload.price > 0;

    const message = await this.messageModel.create({
      ...payload,
      isSale: checkIsSale,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });

    const dto = new MessageDto(message);
    await this.queueEventService.publish({
      channel: MESSAGE_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });

    return dto;
  }

  public async createPrivateFileMessage(
    sender: IRecipient,
    recipient: IRecipient,
    file: FileDto,
    payload: MessageCreatePayload
  ): Promise<MessageDto> {
    const conversation = await this.conversationService.createPrivateConversation(
      sender,
      recipient
    );

    if (!file) throw new HttpException('File is valid!', 400);
    if (!file.isImage()) {
      await this.fileService.removeIfNotHaveRef(file._id);
      throw new HttpException('Invalid image!', 400);
    }

    const checkIsSale = payload.price > 1;

    const message = await this.messageModel.create({
      ...payload,
      type: MESSAGE_TYPE.PHOTO,
      senderId: sender.sourceId,
      fileId: file._id,
      senderSource: sender.source,
      conversationId: conversation._id,
      isSale: checkIsSale,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.fileService.addRef(file._id, {
      itemType: REF_TYPE.MESSAGE,
      itemId: message._id
    });

    const dto = new MessageDto(message);
    dto.imageUrl = `${file.getUrl()}?id=${message._id}`;
    if (checkIsSale) {
      message.ok = false;
      await message.save();
      await this.fileService.queueProcessPhoto(
        file._id,
        {
          meta: {
            id: message._id
          },
          thumbnailSize: {
            width: 250,
            height: 250,
            blur: 100
          },
          publishChannel: PAID_MESSAGE_CHANNEL
        }
      );
      return dto;
    }

    await this.queueEventService.publish({
      channel: MESSAGE_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: new MessageDto(message)
    });

    return dto;
  }

  public async loadMessages(req: MessageListRequest, user: UserDto, jwtToken: string) {
    const conversation = await this.conversationService.findById(
      req.conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      (recipient) => recipient.sourceId.toString() === user._id.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    const query = { conversationId: conversation._id };
    const [data, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort({ createdAt: -1 })
        .lean()
        .limit(req.limit ? Number(req.limit) : 10)
        .skip(Number(req.offset)),
      this.messageModel.countDocuments(query)
    ]);

    const fileIds = data.map((d) => d.fileId);
    const senderIds = uniq(data.map((d) => d.senderId));
    const files = await this.fileService.findByIds(fileIds);
    const senders = await Promise.all([
      this.userService.findByIds(senderIds),
      this.performerService.findByIds(senderIds)
    ]);
    const messages = data.map((m) => new MessageDto(m));
    const productIds = messages.filter((message) => message.isSale).map((message) => message._id);
    const transactions = await this.checkPaymentService.findByQuery({
      status: ORDER_STATUS.PAID,
      productId: { $in: productIds },
      buyerId: user._id
    });

    messages.forEach((message) => {
      if (message.isSale) {
        const transaction = transactions.find((t) => t.productId.equals(message._id));
        // eslint-disable-next-line no-param-reassign
        message.isbought = !!transaction;
      }
      if (message.fileId) {
        const file = files.find(
          (f) => f._id.toString() === message.fileId.toString()
        );

        if (message.isSale) {
          // eslint-disable-next-line no-param-reassign
          message.imageUrl = (message.isbought || message.senderId.equals(user._id)) ? `${file.getUrl()}?id=${message._id}&token=${jwtToken}` : file.getThumbnail();
        } else {
          // eslint-disable-next-line no-param-reassign
          message.imageUrl = file ? `${file.getUrl()}?id=${message._id}&token=${jwtToken}` : null;
        }
      }

      const senderInfo = message.senderSource === 'user'
        ? senders[0].find((u) => u._id.equals(message.senderId))
        : senders[1].find((p) => p._id.equals(message.senderId));
      // eslint-disable-next-line no-param-reassign
      message.senderInfo = {
        username: senderInfo.username
      };
    });

    return {
      data: messages,
      total
    };
  }

  public async deleteMessage(messageId: string, user: UserDto) {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new EntityNotFoundException();
    }
    if (
      user.roles
      && !user.roles.includes('admin')
      && message.senderId.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException();
    }
    await message.remove();
    if (message.type === MESSAGE_TYPE.PHOTO) {
      message.fileId && (await this.fileService.remove(message.fileId));
    }

    await this.queueEventService.publish({
      channel: MESSAGE_CHANNEL,
      eventName: MESSAGE_EVENT.DELETED,
      data: new MessageDto(message)
    });
    // Emit event to user
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.DELETED,
      data: new MessageDto(message)
    });
    return message;
  }

  public async deleteAllMessageInConversation(
    conversationId: string,
    user: any
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }
    if (
      user.isPerformer
      && conversation.performerId.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException();
    }

    await this.messageModel.deleteMany({ conversationId: conversation._id });
    return { success: true };
  }

  public async createPublicStreamMessageFromConversation(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient,
    user: UserDto
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const message = await this.messageModel.create({
      ...payload,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    dto.senderInfo = user;
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async createStreamMessageFromConversation(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      (recipient) => recipient.sourceId.toString() === sender.sourceId.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    const message = await this.messageModel.create({
      ...payload,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async loadPublicMessages(req: MessageListRequest) {
    const conversation = await this.conversationService.findById(
      req.conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };

    const query = { conversationId: conversation._id };
    const [data, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(Number(req.limit))
        .skip(Number(req.offset)),
      this.messageModel.countDocuments(query)
    ]);

    const senderIds = uniq(data.map((d) => d.senderId));
    const [users, performers] = await Promise.all([
      senderIds.length ? this.userService.findByIds(senderIds) : [],
      senderIds.length ? this.performerService.findByIds(senderIds) : []
    ]);

    const messages = data.map((message) => {
      let user = null;
      user = users.find((u) => u._id.toString() === message.senderId.toString());
      if (!user) {
        user = performers.find(
          (p) => p._id.toString() === message.senderId.toString()
        );
      }

      return {
        ...message,
        senderInfo:
          user && user.roles && user.roles.includes('user')
            ? new UserDto(user).toResponse()
            : new PerformerDto(user).toResponse()
      };
    });

    return {
      data: messages.map((m) => new MessageDto(m)),
      total
    };
  }

  public async checkAuth(req: any, user: UserDto) {
    const { query } = req;
    if (!query.id) {
      throw new ForbiddenException();
    }

    const message = await this.messageModel.findById(query.id);
    if (!message) throw new EntityNotFoundException();

    if (user._id.toString() === message.senderId.toString() || !message.isSale) {
      return true;
    }

    if (message.isSale) {
      const transactions = await this.checkPaymentService.findByQuery({
        status: ORDER_STATUS.PAID,
        productId: message._id
      });
      if (!transactions.length) {
        throw new ForbiddenException();
      }
      return true;
    }

    throw new ForbiddenException();
  }
}

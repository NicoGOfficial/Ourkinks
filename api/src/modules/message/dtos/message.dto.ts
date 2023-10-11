import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class MessageDto {
  _id: ObjectId;

  conversationId: ObjectId;

  type: string;

  fileId: ObjectId;

  price: number;

  text: string;

  senderId: ObjectId;

  senderSource?: string;

  meta: any;

  isSale: boolean;

  createdAt: Date;

  updatedAt: Date;

  ok: boolean;

  isbought: boolean;

  imageUrl?: string;

  senderInfo?: any;

  constructor(data?: Partial<MessageDto>) {
    Object.assign(this, pick(data, [
      '_id', 'conversationId', 'type', 'fileId', 'imageUrl', 'senderInfo', 'price', 'isSale',
      'text', 'senderId', 'meta', 'createdAt', 'updatedAt', 'senderSource', 'ok', 'isbought'
    ]));
  }
}

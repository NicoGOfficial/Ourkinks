import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class MessageModel extends Document {
  conversationId: ObjectId;

  type: string;

  fileId?: ObjectId;

  price: number;

  text: string;

  senderSource: string;

  senderId: ObjectId;

  isSale: boolean;

  ok: boolean;

  meta?: any;

  createdAt?: Date;

  updatedAt?: Date;
}

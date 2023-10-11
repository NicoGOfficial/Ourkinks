import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // text, file, etc...
  type: {
    type: String,
    default: 'text',
    index: true
  },
  fileId: Schema.Types.ObjectId,
  price: Number,
  text: String,
  senderSource: String,
  senderId: Schema.Types.ObjectId,
  isSale: {
    type: Boolean,
    default: false
  },
  ok: {
    type: Boolean,
    default: true
  },
  meta: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const ModelTranslationSchema = new Schema({
  locale: {
    type: String,
    index: true
  },
  title: {
    type: String
  },
  source: {
    type: String,
    index: true
  },
  sourceId: {
    index: true,
    type: ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: false
});

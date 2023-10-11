import { Schema } from 'mongoose';

export const TextTranslationSchema = new Schema({
  key: {
    type: String,
    index: true
  },
  locale: String,
  value: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

import { Document } from 'mongoose';

export class TextTranslationModel extends Document {
  key: string;

  locale: string;

  value: string;

  createdAt: Date;

  updatedAt: Date;
}

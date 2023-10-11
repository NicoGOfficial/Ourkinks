import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class ModelTranslationModel extends Document {
  locale: string;

  source: string;

  sourceId: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

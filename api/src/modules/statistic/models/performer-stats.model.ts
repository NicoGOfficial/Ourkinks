import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PerformerStatsModel extends Document {
  performerId: ObjectId;

  totalAllLikes: number;

  totalAllComments: number;

  totalMonthlyComments: number;

  totalVideoFavourites: number;

  year: number;

  month: number;

  updatedAt: Date;
}
